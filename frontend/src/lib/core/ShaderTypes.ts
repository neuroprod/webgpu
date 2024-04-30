import MathArray from "@math.gl/core/src/classes/base/math-array";


export const ShaderType = {
    auto: 'auto',
    f: 'f',
    vec2: 'vec2f',
    vec3: 'vec3f',
    vec4: 'vec4f',
    vec4i: 'vec4i',
    mat4: 'mat4x4',
}

export function getAutoType(value: number | MathArray) {

}

export function getShaderTextForShaderType(type: string, arrayLength = 1) {
    let t = ""
    switch (type) {
        case ShaderType.f:
            t = "<f32>";
            break;
        case ShaderType.vec2:
            t = "vec2f";
            break;
        case ShaderType.vec3:
            t = "vec3f";
            break;
        case ShaderType.vec4:
            t = "vec4f";
            break;
        case ShaderType.vec4i:
            t = "vec4i";
            break;
        case ShaderType.mat4:
            if (arrayLength == 1) {
                t = "mat4x4f";
            }

            break;
        default:
            console.warn("no default value")
    }
    //implement arrays
    return t;

}

export function getFormatForShaderType(type: string) {
    let format = "";
    switch (type) {
        case ShaderType.f:
            format = "float32";
            break;
        case ShaderType.vec2:
            format = "float32x2";
            break;
        case ShaderType.vec3:
            format = "float32x3";
            break;
        case ShaderType.vec4:
            format = "float32x4";
            break;
        case ShaderType.vec4i:
            format = "sint32x4";
            break;
        default:
            console.warn("no default value")
    }
    return format as GPUVertexFormat;

}

export function getSizeForShaderType(type: string, arrayLength = 1) {
    let size = 0;
    switch (type) {
        case ShaderType.f:
            size = 1
            break;
        case ShaderType.vec2:
            size = 2
            break;
        case ShaderType.vec3:
            size = 3
            break;
        case ShaderType.vec4:
            size = 4
            break;
        case ShaderType.vec4i:
            size = 4
            break;
        case ShaderType.mat4:
            size = 16
            break;
        default:
            console.warn("no default size")
    }

    return size * arrayLength;
}
