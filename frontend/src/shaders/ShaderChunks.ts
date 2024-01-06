export function getWorldFromUVDepth(){
return /* wgsl */ `
    fn getWorldFromUVDepth(uv:vec2f,z:f32)->vec3f{
        let uvP =vec2f(uv.x,1.0-uv.y);
        let sPos = vec4(uvP * 2.0 - 1.0, z, 1.0);

        let sPosP = camera.inverseViewProjectionMatrix * sPos;
        return (sPosP.xyz / sPosP.w);
    }
`

}
export function fresnelSchlickRoughness(){
    return /* wgsl */ `
fn fresnelSchlickRoughness( cosTheta:f32,  F0:vec3f, roughness:f32)-> vec3f
{
    return F0 + (max(vec3f(1.0 - roughness), F0) - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}
`
}
export function ssr(){
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
fn cubeShadow(cube:texture_cube<f32>,lightPos:vec3f,world:vec3f,uv0:vec2f) -> f32
{
    var dir = lightPos-world;

    var shadowColor =0.0;
    let dirN = normalize(dir);
    let distToLight=distance (lightPos,world);
      
    let randomVec =normalize(vec3f(random(uv0),random(uv0.yx +vec2f(3.9333)),random(uv0.yx+vec2f(0.9))));
    let tangent   = normalize(randomVec -dirN * dot(randomVec, dirN));
    let bitangent = cross(dirN , tangent);
    let TBN       = mat3x3<f32>(tangent, bitangent,dirN); 
      
      
      for(var i=0;i<16;i++){
      
        let distToLightL=distance (lightPos,world);
        let shadowDist = textureSample(cube, mySampler,normalize(dirN +TBN*kernel[i])).x;
        if(shadowDist>distToLightL-0.05){shadowColor +=1.0;};
      }
        return      shadowColor/8.0;

}

        `
}



  export function pointLight(){
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
