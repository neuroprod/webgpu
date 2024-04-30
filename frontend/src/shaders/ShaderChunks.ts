export function getWorldFromUVDepth() {
    return /* wgsl */ `
    fn getWorldFromUVDepth(uv:vec2f,z:f32)->vec3f{
        let uvP =vec2f(uv.x,1.0-uv.y);
        let sPos = vec4(uvP * 2.0 - 1.0, z, 1.0);

        let sPosP = camera.inverseViewProjectionMatrix * sPos;
        return (sPosP.xyz / sPosP.w);
    }
`

}

export function fresnelSchlickRoughness() {
    return /* wgsl */ `
fn fresnelSchlickRoughness( cosTheta:f32,  F0:vec3f, roughness:f32)-> vec3f
{
    return F0 + (max(vec3f(1.0 - roughness), F0) - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}
`
}

export function ssr() {
    return /* wgsl */ `
fn ssr(world:vec3f,N:vec3f,V:vec3f,metallic:f32,roughness:f32,textureSize:vec2f)-> vec3f
{
    var dir= normalize(reflect(-V,N))*uniforms.refSettings1.z;
    var l1 = length(dir);
    var l2=0.0;
    var testPos = world+dir;
    var uv= vec2f(0.0,0.0);
    var found =false;
    let numSteps =i32(uniforms.refSettings2.x);
    for (var i: i32 = 0; i < numSteps; i++) {

        let projTestPos = camera.viewProjectionMatrix *vec4(testPos,1.0);

        if( projTestPos.w<0.0 || testPos.z>0.0 ){
            return  vec3(0.01);
        }

        let screenTestPos  = projTestPos.xyz/projTestPos.w;


        let uvTestS = screenTestPos.xy*0.5+0.5;

        let uvTest = vec2<i32>(floor(vec2(uvTestS.x,1-uvTestS.y)*textureSize));
        let textureDepth =textureLoad(gDepth,uvTest,0).x;
        let dist = screenTestPos.z-textureDepth;

        if(dist>0.0 && dist <l1-l2 ){

            found =true;
            break;
        }
        l2 =l1;
        l1*=uniforms.refSettings1.w;
        dir*=uniforms.refSettings1.w;
        testPos += dir;
    }
    if(found){

        dir*=-0.5;
        var s =-1.0;
        let numStepsT =i32(uniforms.refSettings2.y);
        for (var i: i32 = 0; i < numStepsT; i++) {

            testPos+=dir;
            let projTestPos = camera.viewProjectionMatrix *vec4(testPos,1.0);
            let screenTestPos  = projTestPos.xyz/projTestPos.w;


            let uvTestS = screenTestPos.xy*0.5+0.5;
            let uvTestSI =vec2(uvTestS.x,1-uvTestS.y);
            let uvTest = vec2<i32>(floor(uvTestSI *textureSize));
            let textureDepth =textureLoad(gDepth,uvTest,0).x;
            let dist = screenTestPos.z-textureDepth;
            if (dist>0.0){
                dir*=0.5*(-s);
                s= -1.0;
            }
            else {
                dir*=0.5*s;
                s= 1.0;
            }
            uv =uvTestSI ;
            if (dist>-0.001 && dist<0.001){
                uv =uvTestSI ;
                break;
            }



        }



    }else
    {
        return  vec3f(uniforms.refSettings2.w,uniforms.refSettings2.w,0.0);
    }
    if(uv.x==0) {return  vec3f(uniforms.refSettings2.w,0.0,uniforms.refSettings2.w);}



    let numlevels = f32(textureNumLevels(reflectTexture));
    let sampleRoughness =1.0-(pow(1.0-roughness,2.0));
    let color =textureSampleLevel(reflectTexture,mySampler,uv, sampleRoughness*numlevels).xyz;

    return color*(uniforms.refSettings1.x+metallic*uniforms.refSettings1.y);

} 
`
}

export function cubeShadow() {
    return   /* wgsl */ `
fn cubeShadow(cube:texture_cube<f32>,lightPos:vec3f,world:vec3f,uv0:vec2f,samples:f32) -> f32
{
    var dir = lightPos-world;

    var shadowColor =0.0;
    let dirN = normalize(dir);
    let distToLight=distance (lightPos,world);
      
    let randomVec =normalize(vec3f(random(uv0),random(uv0.yx +vec2f(3.9333)),random(uv0.yx+vec2f(0.9))));
    let tangent   = normalize(randomVec -dirN * dot(randomVec, dirN));
    let bitangent = cross(dirN , tangent);
    let TBN       = mat3x3<f32>(tangent, bitangent,dirN); 
     
      let st =i32(samples);
      
      for(var i=0;i<st;i++){
      
      
        let shadowDist = textureSample(cube, mySampler,normalize(dirN +TBN*kernel[i])).x;
  
        
        if(shadowDist>distToLight-0.05){shadowColor +=1.0;};
      }
        return      shadowColor/samples;

}

        `
}


export function pointLight() {
    return   /* wgsl */ `
  
fn pointLight(lightPos:vec3f ,lightColor:vec4f,albedo:vec3f,world:vec3f,N:vec3f,V:vec3f,F0:vec3f,roughness:f32)->vec3f
{       let distToLight=distance (lightPos.xyz,world);
    let lightVec = lightPos - world;
    let L = normalize(lightVec);
    let H = normalize(V + L);
    let NdotV = max(0.0, dot(N, V));
    let NDF = DistributionGGX(N, H, roughness);
    let G   = GeometrySmith(N, V, L, roughness);
    let F    = fresnelSchlick(max(dot(H, V), 0.0), F0);

    let kS = F;
    let kD = vec3(1.0) - kS;

    let numerator    = NDF * G * F;
    let denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.0001;
    let specular     = numerator / denominator;
    let an  =1.0/pow( distToLight,2.0);
    let radiance =lightColor.xyz *lightColor.w*an;

    let NdotL = max(dot(N, L), 0.0);
    let lightL= (kD * albedo / PI + specular) * radiance * NdotL ;
    return lightL;
}
`
}


export function simplex3D() {

    return   /* wgsl */ `

fn mod289_3(x: vec3<f32>) -> vec3<f32> {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

fn mod289_4(x: vec4<f32>) -> vec4<f32> {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}
fn permute_4(x: vec4<f32>) -> vec4<f32> {
  return mod289_4(((x * 34.0) + 10.0) * x);
}
fn taylorInvSqrt_4(r: vec4<f32>) -> vec4<f32> {
  return 1.79284291400159 - 0.85373472095314 * r;
}


   fn snoise3d(v: vec3<f32>) -> f32 {
  let C = vec2<f32>(1.0 / 6.0, 1.0 / 3.0) ;
  let D = vec4<f32>(0.0, 0.5, 1.0, 2.0);

  // First corner
  var i = floor(v + dot(v, C.yyy));
  let x0 = v - i + dot(i, C.xxx);

  // Other corners
  let g = step(x0.yzx, x0.xyz);
  let l = 1.0 - g;
  let i1 = min( g.xyz, l.zxy );
  let i2 = max( g.xyz, l.zxy );

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  let x1 = x0 - i1 + C.xxx;
  let x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  let x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

  // Permutations
  i = mod289_3(i);
  let p = permute_4(
    permute_4(
      permute_4(i.z + vec4<f32>(0.0, i1.z, i2.z, 1.0)) + i.y + vec4<f32>(0.0, i1.y, i2.y, 1.0)
    ) + i.x + vec4<f32>(0.0, i1.x, i2.x, 1.0)
  );

  // Gradients: 7x7 points over a square, mapped onto an octahedron.
  // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  let n_ = 0.142857142857; // 1.0/7.0
  let  ns = n_ * D.wyz - D.xzx;

  let j = p - 49.0 * floor(p * ns.z * ns.z); // mod(p, 7 * 7)

  let x_ = floor(j * ns.z);
  let y_ = floor(j - 7.0 * x_); // mod(j, N)

  let x = x_ * ns.x + ns.yyyy;
  let y = y_ * ns.x + ns.yyyy;
  let h = 1.0 - abs(x) - abs(y);

  let b0 = vec4<f32>(x.xy, y.xy);
  let b1 = vec4<f32>(x.zw, y.zw);

  // let s0 = vec4<f32>(lessThan(b0,0.0))*2.0 - 1.0;
  // let s1 = vec4<f32>(lessThan(b1,0.0))*2.0 - 1.0;
  let s0 = floor(b0) * 2.0 + 1.0;
  let s1 = floor(b1) * 2.0 + 1.0;
  let sh = -step(h, vec4<f32>(0.0));

  let a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  let a1 = b1.xzyw + s1.xzyw*sh.zzww;

  var p0 = vec3<f32>(a0.xy, h.x);
  var p1 = vec3<f32>(a0.zw, h.y);
  var p2 = vec3<f32>(a1.xy, h.z);
  var p3 = vec3<f32>(a1.zw, h.w);

  // Normalise gradients
  let norm = taylorInvSqrt_4(vec4<f32>(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 = p0 * norm.x;
  p1 = p1 * norm.y;
  p2 = p2 * norm.z;
  p3 = p3 * norm.w;

  // Mix final noise value
  var m = max(0.6 - vec4<f32>(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), vec4<f32>(0.0));
  m = m * m;

  return 42.0 * dot(
    m * m,
    vec4<f32>(dot(p0, x0), dot(p1,x1), dot(p2,x2), dot(p3,x3))
  );
}
    `

}
