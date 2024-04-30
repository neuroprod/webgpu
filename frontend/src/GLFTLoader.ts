import PreLoader from "./lib/PreLoader";
import Mesh from "./lib/core/Mesh";
import Renderer from "./lib/Renderer";
import Object3D from "./lib/core/Object3D";
import Model from "./lib/model/Model";
import TestShader from "./shaders/TestShader";
import Material from "./lib/core/Material";
import GBufferShader from "./shaders/GBufferShader";
import GlassShader from "./shaders/GlassShader";
import {Matrix4, Quaternion, Vector3, Vector4} from "math.gl";
import Animation from "./lib/animation/Animation";
import AnimationChannelQuaternion from "./lib/animation/AnimationChannelQuaternion";
import AnimationChannelVector3 from "./lib/animation/AnimationChannelVector3";
import Skin from "./lib/animation/Skin";
import GBufferShaderSkin from "./shaders/GBufferShaderSkin";
import HitTestObject from "./lib/meshes/HitTestObject";
import {materialData} from "./PreloadData";

import DepthSkinShader from "./shaders/DepthSkinShader";
import DepthShader from "./shaders/DepthShader";
import SolidShader from "./shaders/SolidShader";
import SolidShaderAlpha from "./shaders/SolidShaderAlpha";
import {CullMode} from "./lib/WebGPUConstants";


type Accessor = {
    accessor: any;
    bufferView: any;
}
type ModelData = {
    model: Model;
    meshID: number;
    skinID: number
}


export default class GLFTLoader {
    public root: Object3D;
    public models: Array<Model> = []
    public modelsGlass: Array<Model> = []
    public modelsHit: Array<Model> = []
    public modelsByName: { [name: string]: Model } = {};

    public modelData: Array<ModelData> = [];

    public objects: Array<Object3D> = []
    public objectsByID: { [id: number]: Object3D } = {};
    public objectsByName: { [name: string]: Object3D } = {};
    public materialsByName: { [name: string]: Material } = {};
    public meshByName: { [name: string]: Mesh } = {};
    public meshes: Array<Mesh> = []
    public animations: Array<Animation> = []
    barycentric: boolean = false;
    private meshBuffer: SharedArrayBuffer | ArrayBuffer;
    private byteLength: any;
    private json: any;
    private accessors: Array<Accessor> = []
    private renderer: Renderer;
    private mainShader: TestShader;
    private glassShader: GlassShader;
    private url: string;
    private skins: Array<Skin> = [];
    private skinShader: GBufferShaderSkin;
    private parent: GLFTLoader;
    materialSolid: Material;

    constructor(renderer: Renderer, url: string, preLoader: PreLoader, parent: GLFTLoader = null) {
        this.renderer = renderer;
        this.parent = parent;
        this.root = new Object3D(renderer, "sceneRoot");
        this.skinShader = new GBufferShaderSkin(this.renderer, "gBufferShaderSkin");
        this.mainShader = new GBufferShader(this.renderer, "gBufferShader");

        this.glassShader = new GlassShader(this.renderer, "glassShader");
        this.url = url;
        preLoader.startLoad();
        this.loadURL(url).then(() => {
            preLoader.stopLoad();
        });
        this.materialSolid = new Material(this.renderer, "solidshaderOutline", new SolidShader(this.renderer, "solidShader"))
    }

    async loadURL(url: any) {

        const responseBuffer = await fetch(url + ".bin")

        this.meshBuffer = await responseBuffer.arrayBuffer();

        const response = await fetch(url + ".json")

        let text = await response.text()
        this.json = JSON.parse(text)

        // this.makeBuffer()
        // console.log(this.json)

        if (this.parent) {
            this.parseAccessors()
            this.parseScene();
            this.parseAnimationsParent();
        } else {
            this.parseAccessors()
            this.parseMeshes();
            this.parseScene();
            this.parseAnimations();
            this.parseSkin();
            this.makeModels();
        }
        this.meshBuffer = null;
        this.json = null;
    }

    toMatrixData(f: Float32Array) {

        let v = [];
        for (let i = 0; i < f.length; i += 16) {
            let m = new Matrix4()
            for (let j = 0; j < 16; j++) {
                m[j] = f[i + j]
            }
            v.push(m)
        }
        return v;
    }

    toVector3Array(f: Float32Array) {

        let v = [];
        for (let i = 0; i < f.length; i += 3) {
            v.push(new Vector3(f[i], f[i + 1], f[i + 2]))
        }
        return v;
    }

    toQuaternionArray(f: Float32Array) {
        let v = [];
        for (let i = 0; i < f.length; i += 4) {
            v.push(new Quaternion(f[i], f[i + 1], f[i + 2], f[i + 3]))
        }
        return v;
    }

    private makeModels() {
        let data = materialData;

        for (let m of this.modelData) {
            m.model.mesh = this.meshes[m.meshID]


            if (m.model.mesh.hitTestObject) {

                m.model.hitTestObject = m.model.mesh.hitTestObject;

                m.model.needsHitTest = true;

                this.modelsHit.push(m.model);
            }

            let mData = materialData[m.model.mesh.label]


            if (mData) {
                if (m.model.mesh.label == "stickHold") {

                    mData.needsHitTest = false;
                    mData.needsAlphaClip = true;
                }
                if (m.model.mesh.label == "stick") {

                    mData.alphaClipValue = 0.5;
                }
                m.model.needsHitTest = mData.needsHitTest
                m.model.needsAlphaClip = mData.needsAlphaClip
                if (m.model.needsAlphaClip) {
                    let mat = new Material(this.renderer, "solidshaderOutlineAlpha", new SolidShaderAlpha(this.renderer, "solidShaderAlpha"))

                    let opTexture = this.getTexture(m.model.mesh.label + "_Op");
                    if (opTexture) {
                        mat.uniforms.setTexture("opTexture", opTexture)
                        mat.uniforms.setUniform("alphaClipValue", mData.alphaClipValue)
                        mat.cullMode = CullMode.None
                    }

                    m.model.materialSolid = mat;
                } else {
                    m.model.materialSolid = this.materialSolid;
                }

                m.model.alphaClipValue = mData.alphaClipValue
                m.model.castShadow = mData.castShadow;
                m.model.visible = mData.visible;
                m.model.needsWind = mData.needsWind;
                m.model.normalAdj = mData.normalAdj;
                m.model.needCulling = mData.needCulling;
                m.model.windData = new Vector4(mData.windData[0], mData.windData[1], mData.windData[2], mData.windData[3])
            }
            m.model.material = this.makeMaterial(m.model.mesh.label, m.skinID) //this.materials[m.meshID]
            m.model.shadowMaterial = this.makeShadowMaterial(m.model.mesh.label, m.skinID)
            if (m.model.label.includes("_G")) {
                this.modelsGlass.push(m.model);
            } else {
                this.models.push(m.model);
            }

        }
    }

    private makeShadowMaterial(name: string, skinID: number) {
        let md = materialData[name];
        if (skinID != undefined) {
            let m = new Material(this.renderer, "skinDepth", new DepthSkinShader(this.renderer));
            m.skin = this.skins[skinID];
            return m;
        }
        if (md) {
            if (!md.castShadow) return null;


            let shader = new DepthShader(this.renderer, "depthShader");
            if (md) {
                shader.setMaterialData(md);
            }
            let material = new Material(this.renderer, "depth", shader);
            if (md) {

                if (!md.needCulling) material.cullMode = "none"
            }
            if (md.needsAlphaClip) {
                let opTexture = this.getTexture(name + "_Op");
                if (opTexture) {
                    material.uniforms.setTexture("opTexture", opTexture)

                }

            }
            return material;


            /*let opTexture = this.getTexture(name + "_Op");
             if (opTexture) {
                let m = new Material(this.renderer,"depthAlpha",new DepthShaderAlpha(this.renderer));
                m.uniforms.setTexture("opTexture", opTexture)
                 return m;
             }*/
        }
        return new Material(this.renderer, "depth", new DepthShader(this.renderer));


    }

    private makeMaterial(name: string, skinID: number) {

        if (this.materialsByName[name] != undefined) return this.materialsByName[name];
        let md = materialData[name];
        let material: Material;
        if (name.includes("_G")) {
            material = new Material(this.renderer, name, this.glassShader);
            material.depthWrite = false;

        } else if (skinID != undefined) {
            material = new Material(this.renderer, name, this.skinShader);
            material.skin = this.skins[skinID];

        } else {
            let shader = new GBufferShader(this.renderer, "gBufferShader");
            if (md) {
                shader.setMaterialData(md);
            }
            material = new Material(this.renderer, name, shader);
            if (md) {

                if (!md.needCulling) material.cullMode = "none"
            }


        }


        let colorTexture = this.getTexture(name + "_Color");

        if (colorTexture) material.uniforms.setTexture("colorTexture", colorTexture)

        let normalTexture = this.getTexture(name + "_Normal");
        if (normalTexture) material.uniforms.setTexture("normalTexture", normalTexture)

        let mraTexture = this.getTexture(name + "_MRA");
        if (mraTexture) material.uniforms.setTexture("mraTexture", mraTexture)

        let opTexture = this.getTexture(name + "_Op");
        if (opTexture) {

            material.uniforms.setTexture("opTexture", opTexture)
        }


        this.materialsByName[name] = material;
        return material;


    }

    private getTexture(text: string) {

        return this.renderer.texturesByLabel["textures/" + text + ".webp"];
    }

    private parseAnimationsParent() {
        // for(an)
        if (!this.json.animations) return;
        for (let animation of this.json.animations) {
            let an = new Animation(this.renderer, animation.name);
            console.log(animation.name)
            for (let c of animation.channels) {
                let sampler = animation.samplers[c.sampler]
                let timeData = this.getAnimationData(this.accessors[sampler.input], "time");
                let type: "translation" | "rotation" | "scale" = c.target.path;
                let start = this.accessors[sampler.input].accessor.min[0];
                let stop = this.accessors[sampler.input].accessor.max[0];
                let interpolation = sampler.interpolation;

                let data = this.getAnimationData(this.accessors[sampler.output], c.target.path);
                let targetNodeL = this.objectsByID[c.target.node];
                let targetNode = this.parent.objectsByName[targetNodeL.label]
                if (targetNode) {
                    if (type == "rotation") {

                        let channel = new AnimationChannelQuaternion(type, start, stop, interpolation, timeData, targetNode)
                        channel.setData(data);
                        an.addChannel(channel);

                    } else if (type == "translation" || type == "scale") {

                        let channel = new AnimationChannelVector3(type, start, stop, interpolation, timeData, targetNode)
                        channel.setData(data);
                        an.addChannel(channel);
                    }
                }
            }
            an.init();
            this.animations.push(an);
        }

    }

    private parseAnimations() {
        // for(an)
        if (!this.json.animations) return;
        for (let animation of this.json.animations) {
            let an = new Animation(this.renderer, animation.name);
            for (let c of animation.channels) {
                let sampler = animation.samplers[c.sampler]
                let timeData = this.getAnimationData(this.accessors[sampler.input], "time");
                let type: "translation" | "rotation" | "scale" = c.target.path;
                let start = this.accessors[sampler.input].accessor.min[0];
                let stop = this.accessors[sampler.input].accessor.max[0];
                let interpolation = sampler.interpolation;

                let data = this.getAnimationData(this.accessors[sampler.output], c.target.path);
                let targetNode = this.objectsByID[c.target.node];

                if (type == "rotation") {

                    let channel = new AnimationChannelQuaternion(type, start, stop, interpolation, timeData, targetNode)
                    channel.setData(data);
                    an.addChannel(channel);

                } else if (type == "translation" || type == "scale") {

                    let channel = new AnimationChannelVector3(type, start, stop, interpolation, timeData, targetNode)
                    channel.setData(data);
                    an.addChannel(channel);
                }

            }
            an.init();
            this.animations.push(an);
        }

    }

    private getAnimationData(accessor: any, targetType: string) {

        //console.log(accessor.accessor.componentType,accessor.accessor.type,targetType)
        let data = this.getSlize(accessor);
        let convData;
        if (accessor.accessor.componentType == 5126) {
            convData = new Float32Array(data)
        } else {
            console.warn("animationCompType not suported", accessor.accessor.componentType);
        }

        if (targetType == "time" && accessor.accessor.type == 'SCALAR') {
            return convData;
        } else if (targetType == "scale" && accessor.accessor.type == 'VEC3') {

            return this.toVector3Array(convData);
        } else if (targetType == "translation" && accessor.accessor.type == 'VEC3') {
            return this.toVector3Array(convData);
        } else if (targetType == "rotation" && accessor.accessor.type == 'VEC4') {
            return this.toQuaternionArray(convData);
        } else {
            console.warn("cant convert type ", targetType, accessor.accessor.type);
        }
        //'VEC3' 'scale'
        //'VEC3' 'translation'
        //'VEC4' 'rotation'
    }

    private addNodesToObject(parent: Object3D, nodes: Array<number>) {
        for (let nodeID of nodes) {

            let nodeData = this.json.nodes[nodeID];
            let node;
            if (nodeData.mesh != undefined) {


                node = new Model(this.renderer, nodeData.name)
                this.modelData.push({model: node, skinID: nodeData.skin, meshID: nodeData.mesh})

                this.modelsByName[node.label] = node;
            } else {
                node = new Object3D(this.renderer, nodeData.name)
            }

            this.objectsByID[nodeID] = node;
            this.objects.push(node);
            this.objectsByName[node.label] = node;
            parent.addChild(node);
            let translation = nodeData.translation;
            if (translation) {
                node.setPosition(translation[0], translation[1], translation[2])

            }

            let scale = nodeData.scale
            if (scale) {
                node.setScale(scale[0], scale[1], scale[2])
            }
            let rotation = nodeData.rotation
            if (rotation) {
                node.setRotation(rotation[0], rotation[1], rotation[2], rotation[3])
            }
            if (nodeData.children) {

                this.addNodesToObject(node, nodeData.children)
            }
        }

    }

    private parseScene() {

        let sceneData = this.json.scenes[0]

        this.addNodesToObject(this.root, sceneData.nodes);

    }

    private parseAccessors() {
        for (let accessor of this.json.accessors) {

            let bufferView = this.json.bufferViews[accessor.bufferView];

            this.accessors.push({accessor: accessor, bufferView: bufferView});
        }
    }

    private parseMeshes() {

        for (let m of this.json.meshes) {
            let primitive = m.primitives[0];


            let mesh = new Mesh(this.renderer, m.name);
            if (this.barycentric) {
                let accessorIndices = this.accessors[primitive.indices]
                let indexData = this.getSlize(accessorIndices);
                let indicesData = new Uint16Array(indexData);

                let posAccessor = this.accessors[primitive.attributes.POSITION];
                let positionData = new Float32Array(this.getSlize(posAccessor));


                let normalAccessor = this.accessors[primitive.attributes.NORMAL];
                let normalData = new Float32Array(this.getSlize(normalAccessor));


                let uv0Accessor = this.accessors[primitive.attributes.TEXCOORD_0];
                let uv0Data = new Float32Array(this.getSlize(uv0Accessor));

                let tangentAccessor = this.accessors[primitive.attributes.TANGENT];
                let tangentData = new Float32Array(this.getSlize(tangentAccessor));


                let indices = new Uint16Array(indicesData.length);
                let positions = new Float32Array(indicesData.length * 3)
                let normals = new Float32Array(indicesData.length * 3)
                let tangents = new Float32Array(indicesData.length * 4)
                let uvs = new Float32Array(indicesData.length * 2)
                let center = new Float32Array(indicesData.length * 3)
                let colors = new Float32Array(indicesData.length * 3)
                for (let i = 0; i < indicesData.length; i += 3) {
                    indices[i] = i;
                    indices[i + 1] = i + 1;
                    indices[i + 2] = i + 2;

                    positions[i * 3] = positionData[indicesData[i] * 3];
                    positions[i * 3 + 1] = positionData[indicesData[i] * 3 + 1];
                    positions[i * 3 + 2] = positionData[indicesData[i] * 3 + 2];

                    positions[(i + 1) * 3] = positionData[indicesData[i + 1] * 3];
                    positions[(i + 1) * 3 + 1] = positionData[indicesData[i + 1] * 3 + 1];
                    positions[(i + 1) * 3 + 2] = positionData[indicesData[i + 1] * 3 + 2];

                    positions[(i + 2) * 3] = positionData[indicesData[i + 2] * 3];
                    positions[(i + 2) * 3 + 1] = positionData[indicesData[i + 2] * 3 + 1];
                    positions[(i + 2) * 3 + 2] = positionData[indicesData[i + 2] * 3 + 2];


                    normals[i * 3] = normalData[indicesData[i] * 3];
                    normals[i * 3 + 1] = normalData[indicesData[i] * 3 + 1];
                    normals[i * 3 + 2] = normalData[indicesData[i] * 3 + 2];

                    normals[(i + 1) * 3] = normalData[indicesData[i + 1] * 3];
                    normals[(i + 1) * 3 + 1] = normalData[indicesData[i + 1] * 3 + 1];
                    normals[(i + 1) * 3 + 2] = normalData[indicesData[i + 1] * 3 + 2];

                    normals[(i + 2) * 3] = normalData[indicesData[i + 2] * 3];
                    normals[(i + 2) * 3 + 1] = normalData[indicesData[i + 2] * 3 + 1];
                    normals[(i + 2) * 3 + 2] = normalData[indicesData[i + 2] * 3 + 2];


                    tangents[i * 4] = tangentData[indicesData[i] * 4];
                    tangents[i * 4 + 1] = tangentData[indicesData[i] * 4 + 1];
                    tangents[i * 4 + 2] = tangentData[indicesData[i] * 4 + 2];
                    tangents[i * 4 + 3] = tangentData[indicesData[i] * 4 + 3];


                    tangents[(i + 1) * 4] = tangentData[indicesData[i + 1] * 4];
                    tangents[(i + 1) * 4 + 1] = tangentData[indicesData[i + 1] * 4 + 1];
                    tangents[(i + 1) * 4 + 2] = tangentData[indicesData[i + 1] * 4 + 2];
                    tangents[(i + 1) * 4 + 3] = tangentData[indicesData[i + 1] * 4 + 3];


                    tangents[(i + 2) * 4] = tangentData[indicesData[i + 2] * 4];
                    tangents[(i + 2) * 4 + 1] = tangentData[indicesData[i + 2] * 4 + 1];
                    tangents[(i + 2) * 4 + 2] = tangentData[indicesData[i + 2] * 4 + 2];
                    tangents[(i + 2) * 4 + 3] = tangentData[indicesData[i + 2] * 4 + 3];

                    uvs[i * 2] = uv0Data[indicesData[i] * 2];
                    uvs[i * 2 + 1] = uv0Data[indicesData[i] * 2 + 1];

                    uvs[(i + 1) * 2] = uv0Data[indicesData[i + 1] * 2];
                    uvs[(i + 1) * 2 + 1] = uv0Data[indicesData[i + 1] * 2 + 1];

                    uvs[(i + 2) * 2] = uv0Data[indicesData[i + 2] * 2];
                    uvs[(i + 2) * 2 + 1] = uv0Data[indicesData[i + 2] * 2 + 1];


//

                    let centerX = positions[i * 3] + positions[(i + 1) * 3] + positions[(i + 2) * 3]
                    let centerY = positions[i * 3 + 1] + positions[(i + 1) * 3 + 1] + positions[(i + 2) * 3 + 1]
                    let centerZ = positions[i * 3 + 2] + positions[(i + 1) * 3 + 2] + positions[(i + 2) * 3 + 2]
                    center[i * 3] = centerX
                    center[i * 3 + 1] = centerY;
                    center[i * 3 + 2] = centerZ;

                    center[(i + 1) * 3] = centerX;
                    center[(i + 1) * 3 + 1] = centerY;
                    center[(i + 1) * 3 + 2] = centerZ;

                    center[(i + 2) * 3] = centerX;
                    center[(i + 2) * 3 + 1] = centerY;
                    center[(i + 2) * 3 + 2] = centerZ;


                    colors[i * 3] = 1;
                    colors[i * 3 + 1] = 0;
                    colors[i * 3 + 2] = 0;

                    colors[(i + 1) * 3] = 0;
                    colors[(i + 1) * 3 + 1] = 1;
                    colors[(i + 1) * 3 + 2] = 0;

                    colors[(i + 2) * 3] = 0;
                    colors[(i + 2) * 3 + 1] = 0;
                    colors[(i + 2) * 3 + 2] = 1;

                }

                mesh.setIndices(indices)
                mesh.setVertices(positions);
                mesh.setNormals(normals);
                mesh.setTangents(tangents);

                mesh.setUV0(uvs)
                mesh.setAttribute("aCenter", center);
                mesh.setColor0(colors)


            } else {
                //5126 float
                //5123 ushort
                //5125  uint
                //5121 ubyte
                let accessorIndices = this.accessors[primitive.indices]
                let indexData = this.getSlize(accessorIndices);
                let indices;
                if (accessorIndices.accessor.componentType == 5123) {
                    indices = new Uint16Array(indexData);

                    mesh.setIndices(indices)


                } else if (accessorIndices.accessor.componentType == 5125) {
                    indices = new Uint32Array(indexData);
                    mesh.setIndices32(indices)
                }


                //POSITION, NORMAL TANGENT TEXCOORD_0,....
                let posAccessor = this.accessors[primitive.attributes.POSITION];

                let positionData = this.getSlize(posAccessor);
                let floatPos = new Float32Array(positionData)
                let md = materialData[m.name];

                if (md) {
                    if (md.needsHitTest) {

                        mesh.hitTestObject = new HitTestObject(m.name)
                        mesh.hitTestObject.setTriangles(indices, floatPos)
                        mesh.hitTestObject.min = new Vector3(posAccessor.accessor.min[0], posAccessor.accessor.min[1], posAccessor.accessor.min[2])
                        mesh.hitTestObject.max = new Vector3(posAccessor.accessor.max[0], posAccessor.accessor.max[1], posAccessor.accessor.max[2])

                    }
                }
                mesh.min = new Vector3(posAccessor.accessor.min[0], posAccessor.accessor.min[1], posAccessor.accessor.min[2]);
                mesh.max = new Vector3(posAccessor.accessor.max[0], posAccessor.accessor.max[1], posAccessor.accessor.max[2]);


                mesh.setVertices(floatPos);


                let normalAccessor = this.accessors[primitive.attributes.NORMAL];
                let normalData = this.getSlize(normalAccessor);
                mesh.setNormals(new Float32Array(normalData));

                let uv0Accessor = this.accessors[primitive.attributes.TEXCOORD_0];
                let uv0Data = this.getSlize(uv0Accessor);
                mesh.setUV0(new Float32Array(uv0Data));

                if (primitive.attributes.TANGENT) {
                    let tangentAccessor = this.accessors[primitive.attributes.TANGENT];
                    let tangentData = this.getSlize(tangentAccessor);
                    mesh.setTangents(new Float32Array(tangentData));
                } else {
                    //  console.warn("no tangent for mesh", m.name)
                }
                if (primitive.attributes.COLOR_0 && md && md.needsWind) {

                    //let colorAccessor = this.accessors[primitive.attributes.COLOR_0];
                    // let colorData = this.getSlize(colorAccessor);
                    // mesh.setColor0(new Float32Array(colorData));
                }

                if (primitive.attributes.WEIGHTS_0) {
                    let weightAccessor = this.accessors[primitive.attributes.WEIGHTS_0];
                    let weightData = this.getSlize(weightAccessor); //bytes

                    mesh.setWeights(new Float32Array(weightData));

                }
                if (primitive.attributes.JOINTS_0) {
                    let jointAccessor = this.accessors[primitive.attributes.JOINTS_0];
                    let jointData = this.getSlize(jointAccessor);
                    let data = new Uint32Array(new Int8Array(jointData));
                    mesh.setJoints(data);
                }
            }
            this.meshes.push(mesh);


        }
    }

    private getSlize(accessor: any) {
        let byteLength = accessor.bufferView.byteLength
        let byteOffset = accessor.bufferView.byteOffset
        let buffer = accessor.bufferView.buffer
        return this.meshBuffer.slice(byteOffset, byteOffset + byteLength);
    }

    private parseSkin() {
        if (!this.json.skins) return;
        for (let s of this.json.skins) {


            let nodeArray = [];
            for (let j of s.joints) {

                nodeArray.push(this.objectsByID[j])
            }

            let accessor = this.accessors[s.inverseBindMatrices];
            let data = this.getSlize(accessor);
            let convData = new Float32Array(data)
            let inverseMatrixes = this.toMatrixData(convData)

            let skin = new Skin(this.renderer, s.name, nodeArray, inverseMatrixes)
            this.skins.push(skin);
        }

    }


}
