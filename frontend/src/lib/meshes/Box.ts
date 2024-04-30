import Mesh from "../core/Mesh";
import Renderer from "../Renderer";

class Vector {
    x = 0;
    y = 0;
    z = 0;
}

export default class Box extends Mesh {
    constructor(renderer: Renderer, {width = 1, height = 1, depth = 1}: {
        width?: number;
        height?: number;
        depth?: number
    } = {}) {
        super(renderer, "box");

        let widthSegments = 1;
        let heightSegments = 1;
        let depthSegments = 1;

        const indices: Array<number> = [];
        const vertices: Array<number> = [];
        const normals: Array<number> = [];
        const uvs: Array<number> = [];

        // helper variables
        type VectorProps = { x: number; y: number; z: number };
        let numberOfVertices = 0;

        const buildPlane = (
            u: keyof VectorProps,
            v: keyof VectorProps,
            w: keyof VectorProps,
            udir: number,
            vdir: number,
            width: number,
            height: number,
            depth: number,
            gridX: number,
            gridY: number
        ) => {
            const segmentWidth = width / gridX;
            const segmentHeight = height / gridY;

            const widthHalf = width / 2;
            const heightHalf = height / 2;
            const depthHalf = depth / 2;

            const gridX1 = gridX + 1;
            const gridY1 = gridY + 1;

            let vertexCounter = 0;

            const vector = new Vector();
            // generate vertices, normals and uvs
            for (let iy = 0; iy < gridY1; iy++) {
                const y = iy * segmentHeight - heightHalf;
                for (let ix = 0; ix < gridX1; ix++) {
                    const x = ix * segmentWidth - widthHalf;

                    // set values to correct vector component
                    vector[u] = x * udir;
                    vector[v] = y * vdir;
                    vector[w] = depthHalf;

                    // now apply vector to vertex buffer
                    vertices.push(vector.x, vector.y, vector.z);

                    // set values to correct vector component
                    vector[u] = 0;
                    vector[v] = 0;
                    vector[w] = depth > 0 ? 1 : -1;

                    // now apply vector to normal buffer
                    normals.push(vector.x, vector.y, vector.z);

                    // uvs
                    uvs.push(ix / gridX);
                    uvs.push(iy / gridY);

                    // counters
                    vertexCounter += 1;
                }
            }

            // indices

            // 1. you need three indices to draw a single face
            // 2. a single segment consists of two faces
            // 3. so we need to generate six (2*3) indices per segment
            for (let iy = 0; iy < gridY; iy++) {
                for (let ix = 0; ix < gridX; ix++) {
                    const a = numberOfVertices + ix + gridX1 * iy;
                    const b = numberOfVertices + ix + gridX1 * (iy + 1);
                    const c = numberOfVertices + (ix + 1) + gridX1 * (iy + 1);
                    const d = numberOfVertices + (ix + 1) + gridX1 * iy;

                    // faces
                    indices.push(a, b, d);
                    indices.push(b, c, d);
                }
            }

            // update total number of vertices
            numberOfVertices += vertexCounter;
        };

        buildPlane(
            "z",
            "y",
            "x",
            -1,
            -1,
            depth,
            height,
            width,
            depthSegments,
            heightSegments
        ); // px
        buildPlane(
            "z",
            "y",
            "x",
            1,
            -1,
            depth,
            height,
            -width,
            depthSegments,
            heightSegments
        ); // nx
        buildPlane(
            "x",
            "z",
            "y",
            1,
            1,
            width,
            depth,
            height,
            widthSegments,
            depthSegments
        ); // py
        buildPlane(
            "x",
            "z",
            "y",
            1,
            -1,
            width,
            depth,
            -height,
            widthSegments,
            depthSegments
        ); // ny
        buildPlane(
            "x",
            "y",
            "z",
            1,
            -1,
            width,
            height,
            depth,
            widthSegments,
            heightSegments
        ); // pz
        buildPlane(
            "x",
            "y",
            "z",
            -1,
            -1,
            width,
            height,
            -depth,
            widthSegments,
            heightSegments
        ); // nz

        this.setIndices(new Uint16Array(indices));
        this.setVertices(new Float32Array(vertices));
        this.setNormals(new Float32Array(normals));
        this.setUV0(new Float32Array(uvs));
    }
}
