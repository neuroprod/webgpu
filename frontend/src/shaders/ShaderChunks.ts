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
