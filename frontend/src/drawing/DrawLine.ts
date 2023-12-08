import {lerp, Vector2, Vector4} from "math.gl";

export default class DrawLine{

    public points:Array<Vector2>=[]
    drawSize: number;


    constructor() {

    }
    smoothing(){


    }
    addPoint(p:Vector2)
    {
        if(this.points.length>1)
        {

            let lastPoint =this.points[this.points.length-1];

            let dist =p.distance( lastPoint);

            let   numSteps =Math.floor(dist/this.drawSize*4);
          if(numSteps==0)return;
            this.points.push(p)


            if(numSteps<2){
                     this.points.push(p)
            }
            else
            {
                for (let i=1;i< numSteps;i++)
                {
                    let pos = 1.0/numSteps *i;

                    this.points.push(lerp(lastPoint,p,pos) as Vector2);

                }

            }

        }else
        {

            this.points.push(p)
        }


    }


}
