import { Image } from "./image";

export class HoughTransformSettings
{
    public Step: number;
    public Bins: number;

    constructor(step: number)
    {
        this.Step = step;
        this.Bins = 180.0 / this.Step;
    }
}

export class HoughLine
{
    public value: number;
    public x1: number;
    public y1: number;
    public x2: number;
    public y2: number;

    constructor()
    {
        this.value = 0;
        this.x1 = 0;
        this.y1 = 0;
        this.x2 = 0;
        this.y2 = 0;
    }
}

export class HoughTransform
{
    private settings: HoughTransformSettings;

    constructor(settings: HoughTransformSettings)
    {
        this.settings = settings;
    }

    public BuildLines(image: Image, source: Image): Array<HoughLine>
    {
        var result: Array<HoughLine> = new Array<HoughLine>();

        var halfHough = image.GetHeight() / 2;
        var halfWidth = source.GetWidth() / 2;
        var halfHeight = source.GetHeight() / 2;

        for (var i: number = 0; i < image.GetHeight(); i++)
        {
            var theta = 0.0;

            for (var j: number = 0; j < image.GetWidth(); j++)
            {
                var sample = image.GetData()[(j + i * image.GetWidth()) * 4 + 0] + 256 * image.GetData()[(j + i * image.GetWidth()) * 4 + 1] + 256 * 256 * image.GetData()[(j + i * image.GetWidth()) * 4 + 2];
                
                if (sample > 0)
                {
                    var line: HoughLine = new HoughLine();
                    line.value = sample;
                    
                    if (theta >= 45 && theta < 135)
                    {
                        line.x1 = 0;
                        line.y1 = ((i - halfHough) - ((line.x1 - halfWidth) * Math.cos(theta * Math.PI / 180.0))) / Math.sin(theta * Math.PI / 180.0) + halfHeight;
                        line.x2 = source.GetWidth() - 0;
                        line.y2 = ((i - halfHough) - ((line.x2 - halfWidth) * Math.cos(theta * Math.PI / 180.0))) / Math.sin(theta * Math.PI / 180.0) + halfHeight;
                    }
                    else
                    {
                        line.y1 = 0;
                        line.x1 = ((i - halfHough) - ((line.y1 - halfHeight) * Math.sin(theta * Math.PI / 180.0))) / Math.cos(theta * Math.PI / 180.0) + halfWidth;
                        line.y2 = source.GetHeight() - 0;
                        line.x2 = ((i - halfHough) - ((line.y2 - halfHeight) * Math.sin(theta * Math.PI / 180.0))) / Math.cos(theta * Math.PI / 180.0) + halfWidth;
                    }

                    result.push(line);
                }

                theta += this.settings.Step;
            }
        }

        result.sort((a: HoughLine, b: HoughLine) => {
            return b.value - a.value;
        });

        console.log(result);

        return result;
    }

    public Process(source: Image): Image
    {
        var houghSize = Math.sqrt(2.0) * (source.GetWidth() > source.GetHeight() ? source.GetWidth() : source.GetHeight()) * 0.5;
        var targetHeight = (houghSize * 2.0) | 0;
        var targetWidth = this.settings.Bins | 0;

        var accu: Uint32Array = new Uint32Array(targetWidth * targetHeight);
        for (var i: number = 0; i < targetWidth * targetHeight; i++)
        {
            accu[i] = 0;
        }

        var centerX = source.GetWidth() / 2;
        var centerY = source.GetHeight() / 2;

        for (var y: number = 0; y < source.GetHeight(); y++)
        {
            for (var x: number = 0; x < source.GetWidth(); x++)
            {
                var data = source.GetData()[(x + y * source.GetWidth()) * 4 + 0] * 0.299 + source.GetData()[(x + y * source.GetWidth()) * 4 + 0] * 0.587 + source.GetData()[(x + y * source.GetWidth()) * 4 + 0] * 0.114;
                if (data > 250)
                {
                    for (var t: number = 0; t < this.settings.Bins; t += this.settings.Step)
                    {
                        var rho = ((x - centerX) * Math.cos(t * Math.PI / 180.0)) + ((y - centerY) * Math.sin(t * Math.PI / 180.0));
                        accu[((Math.round(rho + houghSize) * this.settings.Bins + t) | 0)]++;
                    }
                }
            }
        }
        
        var target: Image = new Image(targetWidth, targetHeight);
        console.log(target);
        for (var y: number = 0; y < targetHeight; y++)
        {
            for (var x: number = 0; x < targetWidth; x++)
            {
                target.GetData()[(x + y * targetWidth) * 4 + 0] = accu[x + y * targetWidth] & 0x000000FF;
                target.GetData()[(x + y * targetWidth) * 4 + 1] = accu[x + y * targetWidth] & 0x0000FF00;
                target.GetData()[(x + y * targetWidth) * 4 + 2] = accu[x + y * targetWidth] & 0x00FF0000;
                target.GetData()[(x + y * targetWidth) * 4 + 3] = 255;
            }
        }

        return target;

        /*var maxDistance: number = (Math.sqrt(source.GetWidth() * source.GetWidth() + source.GetHeight() * source.GetHeight()) | 0);

        var target: Image = new Image(maxDistance * 2, 180);

        for (var i: number = 0; i < source.GetHeight(); i++)
        {
            for (var j: number = 0; j < source.GetWidth(); j++)
            {
                for (var theta: number = 0; theta <= 180; theta++)
                {
                    var rho = Math.round(j * Math.cos((theta - 90) * Math.PI / 180.0) + i * Math.sin((theta - 90) * Math.PI / 180.0)) + maxDistance;

                    var prev = target.GetData()[(rho + theta * target.GetWidth()) * 4 + 0] + 256 * target.GetData()[(rho + theta * target.GetWidth()) * 4 + 1] + 256 * 256 * target.GetData()[(rho + theta * target.GetWidth()) * 4 + 2];
                    prev = prev + 1;

                    target.GetData()[(rho + theta * target.GetWidth()) * 4 + 2] = (prev / (256 * 256)) | 0;
                    prev -= 256 * 256 * target.GetData()[(rho + theta * target.GetWidth()) * 4 + 2];
                    
                    target.GetData()[(rho + theta * target.GetWidth()) * 4 + 1] = (prev / 256) | 0;
                    prev -= 256 * target.GetData()[(rho + theta * target.GetWidth()) * 4 + 1];

                    target.GetData()[(rho + theta * target.GetWidth()) * 4 + 0] = prev | 0;

                    target.GetData()[(rho + theta * target.GetWidth()) * 4 + 3] = 255;
                }
            }
        }

        return target;*/
    }

    public NormalizeGrayscale(image: Image)
    {
        var maximum = 0;

        for (var i: number = 0; i < image.GetHeight(); i++)
        {
            for (var j: number = 0; j < image.GetWidth(); j++)
            {
                var sample = image.GetData()[(j + i * image.GetWidth()) * 4 + 0] + 256 * image.GetData()[(j + i * image.GetWidth()) * 4 + 1] + 256 * 256 * image.GetData()[(j + i * image.GetWidth()) * 4 + 2];
                if (sample > maximum)
                {
                    maximum = sample;
                }
            }
        }
        
        for (var i: number = 0; i < image.GetHeight(); i++)
        {
            for (var j: number = 0; j < image.GetWidth(); j++)
            {
                var sample = image.GetData()[(j + i * image.GetWidth()) * 4 + 0] + 256 * image.GetData()[(j + i * image.GetWidth()) * 4 + 1] + 256 * 256 * image.GetData()[(j + i * image.GetWidth()) * 4 + 2];
                sample /= maximum;
                sample *= 255;
                sample *= 4;
                if (sample > 255)
                {
                    sample = 255;
                }
                sample = sample | 0;

                image.GetData()[(j + i * image.GetWidth()) * 4 + 0] = sample;
                image.GetData()[(j + i * image.GetWidth()) * 4 + 1] = sample;
                image.GetData()[(j + i * image.GetWidth()) * 4 + 2] = sample;
                image.GetData()[(j + i * image.GetWidth()) * 4 + 3] = 255;
            }
        }
    }
}