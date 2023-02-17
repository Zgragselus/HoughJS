import { Image } from "./image";

export class Canvas
{
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D | null;

    public constructor(target: HTMLElement, id: string, width: number, height: number)
    {
        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d");
        this.canvas.id = id;
        this.canvas.width = width;
        this.canvas.height = height;

        target.appendChild(this.canvas);
    }

    public Resize(width: number, height: number)
    {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    public GetContext(): CanvasRenderingContext2D | null
    {
        return this.context;
    }

    public DrawImage(image: Image)
    {
        this.GetContext()?.putImageData(new ImageData(image.GetData(), image.GetWidth(), image.GetHeight()), 0, 0);
    }
}