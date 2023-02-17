import { Canvas } from "./canvas";

export class Image
{
    private width: number;
    private height: number;
    private data: Uint8ClampedArray;

    public constructor(width: number, height: number, canvas: Canvas | null = null)
    {
        this.width = width;
        this.height = height;

        if (canvas != null)
        {
            var imageData: ImageData | undefined = canvas!.GetContext()?.getImageData(0, 0, this.width, this.height);
            if (imageData != undefined)
            {
                this.data = new Uint8ClampedArray(width * height * 4);

                for (var i: number = 0; i < this.height; i++)
                {
                    for (var j: number = 0; j < this.width; j++)
                    {
                        this.data[(j + i * this.width) * 4 + 0] = imageData.data[(j + i * this.width) * 4 + 0];
                        this.data[(j + i * this.width) * 4 + 1] = imageData.data[(j + i * this.width) * 4 + 1];
                        this.data[(j + i * this.width) * 4 + 2] = imageData.data[(j + i * this.width) * 4 + 2];
                        this.data[(j + i * this.width) * 4 + 3] = imageData.data[(j + i * this.width) * 4 + 3];
                    }
                }
            }
            else
            {
                this.data = new Uint8ClampedArray(width * height * 4);
            }
        }
        else
        {
            this.data = new Uint8ClampedArray(width * height * 4);
        }

        /*console.log(this.width);
        console.log(this.height);
        console.log(this.data);
        console.log(imageData);*/
    }

    public GetWidth(): number
    {
        return this.width;
    }

    public GetHeight(): number
    {
        return this.height;
    }

    public GetData(): Uint8ClampedArray
    {
        return this.data;
    }
}