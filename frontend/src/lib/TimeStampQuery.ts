import Renderer from "./Renderer";
import UI from "./UI/UI";

export default class TimeStampQuery {
    public totalTime: number = 0;
    public timeArray: Array<number>;
    public names: Array<string> = []
    private querySet: GPUQuerySet;
    private queryBuffer: GPUBuffer;
    private capacity: number = 2;
    private device: GPUDevice;
    //--enable-dawn-features=allow_unsafe_apis
    // on mac: /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --enable-dawn-features=allow_unsafe_apis
    private renderer: Renderer;
    private useTimeStampQuery: boolean;
    private stampIndex = 0;


    constructor(renderer: Renderer, numStamps: number) {

        this.renderer = renderer;
        this.device = this.renderer.device;
        this.capacity = numStamps + 1;//Max number of timestamps we can store
        this.timeArray = new Array<number>(numStamps);
        this.timeArray.fill(0);
        this.useTimeStampQuery = this.renderer.useTimeStampQuery
        if (this.useTimeStampQuery) {
            this.querySet = this.device.createQuerySet({
                type: "timestamp",
                count: this.capacity,
            });
            this.queryBuffer = this.device.createBuffer({
                size: 8 * this.capacity,
                usage: GPUBufferUsage.QUERY_RESOLVE
                    | GPUBufferUsage.STORAGE
                    | GPUBufferUsage.COPY_SRC
                    | GPUBufferUsage.COPY_DST,
            });
        }
    }

    start() {
        if (!this.useTimeStampQuery) return;
        this.stampIndex = 0;
        this.names = []
        this.renderer.commandEncoder.writeTimestamp(this.querySet, this.stampIndex)
        this.stampIndex++;
    }

    setStamp(name: string) {

        if (!this.useTimeStampQuery) return;
        this.names.push(name);
        this.renderer.commandEncoder.writeTimestamp(this.querySet, this.stampIndex)
        this.stampIndex++;
    }

    stop() {
        if (!this.useTimeStampQuery) return;

        this.renderer.commandEncoder.resolveQuerySet(
            this.querySet,
            0,// index of first query to resolve
            this.capacity,//number of queries to resolve
            this.queryBuffer,
            0);// destination offset
    }

    onUI() {
        if (!this.useTimeStampQuery) {

        } else {


            UI.LText(this.totalTime.toFixed(3) + " ms", "GPUTime");
            UI.separator("Passes")
            for (let i = 0; i < this.names.length; i++) {

                UI.LText(this.timeArray[i].toFixed(3) + " ms", this.names[i]);
            }
        }
    }

    getData() {
        if (!this.useTimeStampQuery) return;
        const arrayBuffer = this.readBuffer(this.device, this.queryBuffer);
        arrayBuffer.then((value) => {
            const timingsNanoseconds = new BigInt64Array(value);
            this.totalTime = (Number((timingsNanoseconds[this.capacity - 1] - timingsNanoseconds[0])) / 1000000);

            for (let i = 0; i < this.capacity - 1; i++) {

                this.timeArray[i] = (Number((timingsNanoseconds[i + 1] - timingsNanoseconds[i])) / 1000000);

            }
        })


    }

    async readBuffer(device: GPUDevice, buffer: GPUBuffer) {
        const size = buffer.size;
        const gpuReadBuffer = device.createBuffer({size, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ});
        const copyEncoder = device.createCommandEncoder();
        copyEncoder.copyBufferToBuffer(buffer, 0, gpuReadBuffer, 0, size);
        const copyCommands = copyEncoder.finish();
        device.queue.submit([copyCommands]);
        await gpuReadBuffer.mapAsync(GPUMapMode.READ);
        return gpuReadBuffer.getMappedRange();
    }
}
