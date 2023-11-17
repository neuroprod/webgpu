import Shader from "../lib/core/Shader";
import {ShaderType} from "../lib/core/ShaderTypes";
import DefaultTextures from "../lib/textures/DefaultTextures";
import {Vector3} from "math.gl";
import Camera from "../lib/Camera";
import {getWorldFromUVDepth} from "./ShaderChunks";


export default class AOShader extends Shader {


    init() {

        if (this.attributes.length == 0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aUV0", ShaderType.vec2);

        }
        this.addUniform("radius", 1.0);
        this.addUniform("strength", 1.0);
        this.addUniform("numSamples", 8.0);
        this.addTexture("gDepth", DefaultTextures.getWhite(this.renderer), "unfilterable-float")
        this.addTexture("gNormal", DefaultTextures.getWhite(this.renderer), "unfilterable-float")
        // this.addSampler("mySampler");
        this.needsCamera = true;
        this.logShaderCode = true;
    }

    getNiceKernel() {

        return "const kernel = array<vec3f, 64>(vec3(0.10522227859684749, 0.06460165739926547,0.038824459252362706),vec3(0.00014165154848284979, 0.00016493790166550497,0.0003903967613531313),vec3(-0.011717236723087021, 0.001403926696708331,0.003965886034414429),vec3(0.018051134464397274, 0.0010857771967507045,0.032417139842691),vec3(-0.03142783281617277, 0.0093125452883976,0.056167744842457366),vec3(-0.30447262897436655, -0.16754927951661974,0.5774565406786338),vec3(0.007577121354604334, 0.024733295008427428,0.016381772084969437),vec3(-0.2640774506321343, 0.21326947161685814,0.26656414719069615),vec3(0.11826795564053158, 0.06468675075291029,0.12853409225482987),vec3(0.00004537473363853314, -0.00027691453515678267,0.00022022346102036335),vec3(-0.3513485032385567, 0.4940201575771206,0.1527450688805614),vec3(-0.029151829318192123, -0.03830675358549593,0.03853643591064525),vec3(0.30192102157862033, -0.12719776849346945,0.3682447780467376),vec3(-0.8247044859013016, -0.04490137099716762,0.5106464751670744),vec3(-0.046078280917639984, 0.043936992033110314,0.03522097758096499),vec3(0.021738869591146886, -0.001454976972429888,0.016643766042212908),vec3(0.5091567011617275, -0.0828078089286877,0.2810631449538951),vec3(-0.02931280001226339, -0.0033449541655841235,0.04741454217025586),vec3(-0.23930471764111855, -0.2647296006275345,0.2439581782811812),vec3(-0.036293861768301884, -0.17684967911687366,0.36544970980352515),vec3(-0.01725337090139187, -0.020115422511899343,0.0220032793097041),vec3(-0.05969623504843069, 0.09391023888826906,0.09243288442226438),vec3(0.5436867868267107, -0.4764647400176491,0.5699129658127793),vec3(0.006045673552024666, -0.013326183057833438,0.011962801333997106),vec3(-0.14886583378047158, -0.051770329812687046,0.1487346740125807),vec3(-0.38219417386916044, 0.30347667397790135,0.3478137048034231),vec3(0.27744554611066435, 0.29205942008021013,0.5154496121644893),vec3(0.08972832249979619, -0.3278517569420253,0.434013883130455),vec3(-0.01845366426816176, -0.00783907510278912,0.009501311437578323),vec3(-0.07913354034720746, 0.024665823168563746,0.28025762703987916),vec3(-0.2875698600647059, 0.009840130853672717,0.2926424343710775),vec3(-0.2730223658655355, 0.3791115087953961,0.05761552099190384),vec3(-0.007983239374345098, 0.030702402695255492,0.028068017169304394),vec3(0.014038394919206897, -0.0037630796581482303,0.01595931315288135),vec3(0.00037142639032542124, -0.004546842000610197,0.0011466162753209304),vec3(-0.08862046683563603, 0.05143913814219787,0.0025317076400105665),vec3(-0.48008865989795724, 0.16630806811635668,0.13382502443246458),vec3(-0.13527414302039004, 0.02241702250288509,0.15086777000374826),vec3(0.04242521895102758, -0.3802727481506173,0.5721676225487337),vec3(0.3464154798891665, -0.103877208729055,0.3583129444054208),vec3(0.23125865919851943, -0.10422626144094783,0.204049273301269),vec3(-0.015636727407223418, 0.01704717293108945,0.019445113278929352),vec3(0.1519685214802175, 0.09894281387816928,0.0755643798869491),vec3(0.48580933066020465, 0.04709174147489554,0.12115333598128968),vec3(-0.05412315867243057, -0.15485857197181513,0.19653360043511017),vec3(0.09392325073767593, 0.1235308909793108,0.0947093681438779),vec3(0.000016887385973401765, -0.00009378733780868641,0.00009683411538666886),vec3(0.019474315097950147, 0.03759126747491469,0.01779915054000408),vec3(-0.00011547713892444558, -0.00015057456878641524,0.0004807884450912857),vec3(0.138796805886879, -0.09280313587668479,0.23534687353112693),vec3(-0.1218891196507412, -0.049322702584176814,0.06197450416475541),vec3(-0.35207918713128517, 0.0797589320064858,0.23401749048614628),vec3(0.13602920391900758, -0.01227286430154663,0.07086247960685897),vec3(0.5776224376325555, 0.736055780048717,0.02797985136127597),vec3(-0.4467392759223153, -0.08631458066508063,0.7032855672229635),vec3(0.6900061681811902, 0.45524579896838613,0.46159945408616043),vec3(-0.21552436109279305, -0.19656884059450797,0.054960315889068766),vec3(0.28684498266697506, 0.08674591479813416,0.32117268658371345),vec3(-0.03251551122622455, -0.03025727073260717,0.03004213585440461),vec3(0.14882739645246013, -0.3723676230830888,0.23127575410477458),vec3(-0.1535298177916614, -0.06606021916439762,0.19440758306780564),vec3(0.12861036150426008, 0.4476957122069072,0.28857232790047116),vec3(0.13466349281913872, 0.17411434951777144,0.11109163810699821),vec3(0.06998037398077796, -0.3058756718381005,0.25535716323900626), );"

    }

    getKernel() {
        let numSamples = 64;
        let s = "const kernel = array<vec3f, " + numSamples + ">(";
        for (let i = 0; i < numSamples; i++) {
            let v = new Vector3(
                Math.random() * 2.0 - 1.0,
                Math.random() * 2.0 - 1.0,
                Math.random()
            );
            v.normalize();
            v.y += 0.01;
            v.normalize();
            let p = Math.random();
            v.multiplyByScalar(p * p);

            s += "vec3(" + v.x + ", " + v.y + "," + v.z + "),";
        }
        s += " );";
        return s;
    }

    getShaderCode(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////      
struct VertexOutput
{
    @location(0) uv0 : vec2f,
 
    @builtin(position) position : vec4f
  
}



${Camera.getShaderText(0)}
${this.getShaderUniforms(1)}
${this.getNiceKernel()}
@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    
 
    
    output.position =vec4( aPos,1.0);
    
  
    output.uv0 =aUV0;
   
    return output;
}

fn random(st : vec2f ) -> f32 {
  return fract(sin(dot(st.xy, vec2f(12.9898, 78.233))) * 43758.5453123)-0.5;
}
${getWorldFromUVDepth()}

@fragment
fn mainFragment(@location(0)  uv0: vec2f) -> @location(0) vec4f
{
    let textureSize =vec2<f32>( textureDimensions(gNormal));
    let uvPos = vec2<i32>(floor(uv0*textureSize));
    let world=getWorldFromUVDepth(uv0,textureLoad(gDepth,  uvPos ,0).x); 

    let normal = (textureLoad(gNormal,  uvPos ,0).xyz-0.5) *2.0;
    
     let randomVec =normalize(vec3f(random(uv0),random(uv0.yx +vec2f(3.9333)),random(uv0.yx+vec2f(0.9))));
     let tangent   = normalize(randomVec - normal * dot(randomVec, normal));
     let bitangent = cross(normal, tangent);
     let TBN       = mat3x3<f32>(tangent, bitangent, normal); 
    
     var value  =0.0;
     let s =i32(uniforms.numSamples);
     
     for (var i: i32 = 0; i < s; i++) {
        let samplePos3D = (TBN*(kernel[i])*uniforms.radius)+world.xyz;
 
        let posDistance  =distance(samplePos3D,camera.worldPosition.xyz);
        let pos2D = camera.viewProjectionMatrix*vec4f(  samplePos3D,1.0);
        var uvSample = pos2D.xy;
        uvSample/=pos2D.w*2.0;
        uvSample+=vec2f(0.5);
        uvSample.y = 1.0- uvSample.y ;
        let uvK =  vec2<i32>(floor(uvSample*textureSize));
       
        let positionKernel=getWorldFromUVDepth(uvSample,textureLoad(gDepth,   uvK,0).x);
      
        
        let kernelDistance = distance(positionKernel,world);
        if(kernelDistance>uniforms.radius) {
          continue;
          }
         
         let sampleDistance  =distance(positionKernel,camera.worldPosition.xyz);
         let dif = posDistance-sampleDistance;
        if(dif>0.01){
       
        value+=1.0-pow( kernelDistance/uniforms.radius,4.0);
        }
      
         
     }
     value/=uniforms.numSamples;
       value =1.0-value;
     return  vec4f(vec3f(value*uniforms.strength+(1.0-uniforms.strength)),1.0);
}
///////////////////////////////////////////////////////////
        `
    }


}
