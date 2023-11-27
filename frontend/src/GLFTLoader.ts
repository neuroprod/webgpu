import PreLoader from "./lib/PreLoader";
import Mesh from "./lib/core/Mesh";
import Renderer from "./lib/Renderer";
import Object3D from "./lib/core/Object3D";
import Model from "./lib/model/Model";
import TestShader from "./shaders/TestShader";
import Material from "./lib/core/Material";
import ImagePreloader from "./ImagePreloader";
import GBufferShader from "./shaders/GBufferShader";
import GlassShader from "./shaders/GlassShader";
import {Quaternion, Vector3} from "math.gl";
import Animation from "./lib/animation/Animation";
import AnimationChannelQuaternion from "./lib/animation/AnimationChannelQuaternion";
import AnimationChannelVector3 from "./lib/animation/AnimationChannelVector3";


type Accessor = {
    accessor: any;
    bufferView: any;
}


export default class GLFTLoader {
    public root: Object3D;
    public models: Array<Model> = []
    public modelsGlass: Array<Model> = []
    public modelsByName: { [name: string]: Model } = {};
    public objects: Array<Object3D> = []
    public objectsByName: { [name: string]: Object3D } = {};
    public meshes: Array<Mesh> = []
    public materials: Array<Material> = []

    private meshBuffer: SharedArrayBuffer | ArrayBuffer;
    private byteLength: any;
    private json: any;
    private accessors: Array<Accessor> = []
    private renderer: Renderer;

    private mainShader: TestShader;
    private glassShader: GlassShader;
    private url: string;
    private animations: Array<Animation> = []


    constructor(renderer: Renderer, url: string, preLoader: PreLoader) {
        this.renderer = renderer;

        this.root = new Object3D(renderer, "sceneRoot");
        this.mainShader = new GBufferShader(this.renderer, "gBufferShader");
        this.glassShader = new GlassShader(this.renderer, "glassShader");
        this.url = url;
        preLoader.startLoad();
        this.loadURL(url).then(() => {
            preLoader.stopLoad();
        });

    }

    async loadURL(url: any) {

        const responseBuffer = await fetch(url + ".bin")

        this.meshBuffer = await responseBuffer.arrayBuffer();

        const response = await fetch(url + ".json")

        let text = await response.text()
        this.json = JSON.parse(text)

        // this.makeBuffer()
        console.log(this.json)
        this.parseMeshAccessors()
        this.parseMeshes();
        this.parseScene();
        this.parseAnimations()
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

    private parseAnimations() {
        // for(an)
        if (!this.json.animations) return;
        for (let animation of this.json.animations)
        {
            let an = new Animation(this.renderer, animation.name);
            for (let c of animation.channels) {
                let sampler = animation.samplers[c.sampler]
                let timeData = this.getAnimationData(this.accessors[sampler.input], "time");
                let type: "translation" | "rotation" | "scale" = c.target.path;
                let start = this.accessors[sampler.input].accessor.min[0];
                let stop = this.accessors[sampler.input].accessor.max[0];
                let interpolation = sampler.interpolation;

                let data = this.getAnimationData(this.accessors[sampler.output], c.target.path);

                if (type == "rotation") {

                    let channel = new AnimationChannelQuaternion(type, start, stop, interpolation, timeData, this.objects[c.target.node])
                    channel.setData(data);
                    an.addChannel(channel);

                } else if (type == "translation" || type == "scale") {

                    let channel = new AnimationChannelVector3(type, start, stop, interpolation, timeData, this.objects[c.target.node])
                    channel.setData(data);
                    an.addChannel(channel);
                }


//channel.timeData
                // console.log(c.target.path,this.objects[c.target.node].label ,sampler.interpolation);

                //console.log(this.accessors[sampler.input].accessor.min[0],this.accessors[sampler.input].accessor.max[0])
                // channel.target =this.objects[c.target.node]
                //channel.timeData = this.getAnimationData(this.accessors[sampler.input],"time");
                //channel.data=this.getAnimationData(this.accessors[sampler.output],c.target.path);

                //an.addChannel(channel);
                // console.log("time",timeData)
                //  console.log("data",dData)
                // console.log("/////////////")
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
                node.mesh = this.meshes[nodeData.mesh]
                node.material = this.materials[nodeData.mesh]
                if (nodeData.name.includes("_G")) {
                    this.modelsGlass.push(node);
                } else {

                    this.models.push(node);
                }
                this.modelsByName[node.label] = node;
            } else {
                node = new Object3D(this.renderer, nodeData.name)
            }
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

    private parseMeshAccessors() {
        for (let accessor of this.json.accessors) {

            let bufferView = this.json.bufferViews[accessor.bufferView];

            this.accessors.push({accessor: accessor, bufferView: bufferView});
        }
    }

    private makeMaterial(name: string) {
        let material: Material;
        if (name.includes("_G")) {
            material = new Material(this.renderer, name, this.glassShader);
            material.depthWrite = false;

        } else {
            material = new Material(this.renderer, name, this.mainShader);
        }


        let colorTexture = ImagePreloader.getTexture(name + "_Color");
        if (colorTexture) material.uniforms.setTexture("colorTexture", colorTexture)

        let normalTexture = ImagePreloader.getTexture(name + "_Normal");
        if (normalTexture) material.uniforms.setTexture("normalTexture", normalTexture)

        let mraTexture = ImagePreloader.getTexture(name + "_MRA");
        if (mraTexture) material.uniforms.setTexture("mraTexture", mraTexture)


        this.materials.push(material)
    }

    private parseMeshes() {

        for (let m of this.json.meshes) {
            let primitive = m.primitives[0];


            this.makeMaterial(m.name)

            let mesh = new Mesh(this.renderer, m.name);

            //5126 float
            //5123 ushort
            //5125  uint

            let accessorIndices = this.accessors[primitive.indices]
            let indexData = this.getSlize(accessorIndices);

            if (accessorIndices.accessor.componentType == 5123) {
                let indices = new Uint16Array(indexData);

                mesh.setIndices(indices)


            } else if (accessorIndices.accessor.componentType == 5123) {
                let indices = new Uint32Array(indexData);
                mesh.setIndices32(indices)
            }
            //POSITION, NORMAL TANGENT TEXCOORD_0,....
            let posAccessor = this.accessors[primitive.attributes.POSITION];
            let positionData = this.getSlize(posAccessor);


            mesh.setVertices(new Float32Array(positionData));


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


}
