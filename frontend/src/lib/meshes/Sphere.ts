import {Vector3} from "math.gl";
import Mesh from "../core/Mesh";
import Renderer from "../Renderer";

class Vector {
    x = 0;
    y = 0;
    z = 0;
}

export default class Sphere extends Mesh {
    constructor(
        renderer: Renderer,
        radius = 1.0,
        widthSegments = 32,
        heightSegments = 24,
        phiStart = 0,
        phiLength = Math.PI * 2,
        thetaStart = 0,
        thetaLength = Math.PI
    ) {
        super(renderer, "sphere");

        widthSegments = Math.max(3, Math.floor(widthSegments));
        heightSegments = Math.max(2, Math.floor(heightSegments));
        const thetaEnd = Math.min(thetaStart + thetaLength, Math.PI);

        let index = 0;
        const grid = [];

        const vertex = new Vector3();
        const normal = new Vector3();

        const indices = [];
        const vertices = [];
        const normals = [];
        const uvs = [];

        // generate vertices, normals and uvs
        for (let iy = 0; iy <= heightSegments; iy++) {
            const verticesRow = [];
            const v = iy / heightSegments;

            // special case for the poles
            let uOffset = 0;

            if (iy == 0 && thetaStart == 0) {
                uOffset = 0.5 / widthSegments;
            } else if (iy == heightSegments && thetaEnd == Math.PI) {
                uOffset = -0.5 / widthSegments;
            }

            for (let ix = 0; ix <= widthSegments; ix++) {
                const u = ix / widthSegments;

                vertex.x =
                    -radius *
                    Math.cos(phiStart + u * phiLength) *
                    Math.sin(thetaStart + v * thetaLength);
                vertex.y = radius * Math.cos(thetaStart + v * thetaLength);
                vertex.z =
                    radius *
                    Math.sin(phiStart + u * phiLength) *
                    Math.sin(thetaStart + v * thetaLength);

                vertices.push(vertex.x, vertex.y, vertex.z);

                normal.copy(vertex).normalize();
                normals.push(normal.x, normal.y, normal.z);

                uvs.push(u + uOffset, v);
                verticesRow.push(index++);
            }
            grid.push(verticesRow);
        }

        // indices
        for (let iy = 0; iy < heightSegments; iy++) {
            for (let ix = 0; ix < widthSegments; ix++) {
                const a = grid[iy][ix + 1];
                const b = grid[iy][ix];
                const c = grid[iy + 1][ix];
                const d = grid[iy + 1][ix + 1];
                if (iy !== 0 || thetaStart > 0) indices.push(a, b, d);
                if (iy !== heightSegments - 1 || thetaEnd < Math.PI)
                    indices.push(b, c, d);
            }
        }

        this.setIndices(new Uint16Array(indices));
        this.setVertices(new Float32Array(vertices));
        this.setNormals(new Float32Array(normals));
        this.setUV0(new Float32Array(uvs));
    }
}
