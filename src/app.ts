import { Canvas } from "./canvas";
import { HoughLine, HoughTransform, HoughTransformSettings } from "./hough";
import { Image } from "./image";

export class App
{
    private baseElement: HTMLElement;
    private static imageCanvas: Canvas;
    private static houghCanvas: Canvas;

    private static image: Image;
    private static hough: Image;
    private static lines: Array<HoughLine>;
    private static lineCounter: number;

    constructor(base: HTMLElement)
    {
        this.baseElement = base;

        App.imageCanvas = new Canvas(this.baseElement, "viewportImage", 700, 700);
        App.houghCanvas = new Canvas(this.baseElement, "viewportHough", 500, 500);

        this.BuildUI();
    }

    private BuildUI()
    {
        //<a class="waves-effect waves-light btn"><i class="material-icons left">folder</i>Load File...</a>
        //<a class="waves-effect waves-light btn"><i class="material-icons left">folder</i>Save File...</a>

        var loadButton: HTMLElement = document.createElement("a");
        loadButton.id = "loadButton";
        loadButton.classList.add("waves-effect");
        loadButton.classList.add("waves-light");
        loadButton.classList.add("btn");

        var loadIcon: HTMLElement = document.createElement("i");
        loadIcon.classList.add("material-icons");
        loadIcon.textContent = "folder";

        loadButton.appendChild(loadIcon);
        loadButton.textContent = "Load File...";

        this.baseElement.appendChild(loadButton);

        loadButton.addEventListener("click", this.LoadFile);
        
        var saveButton: HTMLElement = document.createElement("a");
        saveButton.id = "saveButton";
        saveButton.classList.add("waves-effect");
        saveButton.classList.add("waves-light");
        saveButton.classList.add("btn");

        var saveIcon: HTMLElement = document.createElement("i");
        saveIcon.classList.add("material-icons");
        saveIcon.textContent = "save";

        saveButton.appendChild(saveIcon);
        saveButton.textContent = "Save Array...";

        this.baseElement.appendChild(saveButton);

        saveButton.addEventListener("click", this.SaveFile);
    }

    private async LoadFile()
    {
        var fileHandle: any;
        [fileHandle] = await (window as any).showOpenFilePicker();
        const file = await fileHandle.getFile();

        var reader: FileReader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = function() {
            var image = document.createElement("img");
            if (reader.result != null)
            {
                image.src = reader.result as string;
            }

            image.onload = function()
            {
                console.log(image.width);
                console.log(image.height);

                App.imageCanvas.Resize(image.width, image.height);
                App.imageCanvas.GetContext()?.drawImage(image, 0, 0);
                App.image = new Image(image.width, image.height, App.imageCanvas);
                App.imageCanvas.Resize(700, 700);
                App.imageCanvas.DrawImage(App.image);

                var transform: HoughTransform = new HoughTransform(new HoughTransformSettings(1));
                App.hough = transform.Process(App.image);
                App.lines = transform.BuildLines(App.hough, App.image);
                transform.NormalizeGrayscale(App.hough);
                App.houghCanvas.DrawImage(App.hough);

                App.lineCounter = 0;
                setInterval(App.Redraw, 1);

                /*if (App.houghCanvas.GetContext() != null)
                {
                    for (var i = 0; i < 100; i++)
                    {
                        App.imageCanvas.GetContext()!.beginPath();
                        App.imageCanvas.GetContext()!.moveTo(App.lines[i].x1, App.lines[i].y1);
                        App.imageCanvas.GetContext()!.lineTo(App.lines[i].x2, App.lines[i].y2);
                        App.imageCanvas.GetContext()!.lineWidth = 1;
                        App.imageCanvas.GetContext()!.strokeStyle = '#ff0000';
                        App.imageCanvas.GetContext()!.stroke();
                    }
                }*/
            }
        };
    }

    private static alpha: number;

    public static Redraw()
    {
        /*if (App.image != null)
        {
            App.imageCanvas.GetContext()?.clearRect(0, 0, 700, 700);
            App.imageCanvas.DrawImage(App.image);

            if (App.houghCanvas.GetContext() != null && App.lines != null)
            {
                var counter = App.lineCounter;
                if (App.lines.length < counter)
                {
                    counter = App.lines.length;
                }

                for (var i = 0; i < counter; i++)
                {
                    App.imageCanvas.GetContext()!.beginPath();
                    App.imageCanvas.GetContext()!.moveTo(App.lines[i].x1, App.lines[i].y1);
                    App.imageCanvas.GetContext()!.lineTo(App.lines[i].x2, App.lines[i].y2);
                    App.imageCanvas.GetContext()!.lineWidth = 1;
                    App.imageCanvas.GetContext()!.strokeStyle = 'rgba(0, 0, 0, 0.1)';
                    App.imageCanvas.GetContext()!.stroke();
                }

                App.lineCounter++;
            }
        }*/

        var max = 0.0;
        var min = 10000.0;
        for (var i = 0; i < App.lines.length; i++)
        {
            max = Math.max(max, App.lines[i].value);
            min = Math.min(min, App.lines[i].value);
        }

        var percentage = 0.05;
        var maxCount = 1000;
        var alpha = 0.03;
        var alphaStep = alpha / maxCount;

        var alphaMax = 0.1;
        var alphaMin = 0.0;

        if (App.image != null)
        {
            if (App.lineCounter == 0)
            {
                App.imageCanvas.GetContext()?.clearRect(0, 0, 700, 700);
                App.alpha = alpha;
            }
            //App.imageCanvas.DrawImage(App.image);

            if (App.houghCanvas.GetContext() != null && App.lines != null)
            {
                var counter = App.lineCounter;

                var percentage: number = ((100 * counter / maxCount) | 0);

                (document.getElementById('progress')!.children[0] as HTMLElement).style.width = percentage + '%';

                //console.log(((100 * counter / maxCount) | 0).toString() + "%");

                if (App.lines.length < counter || counter > maxCount)
                {
                    return;
                }

                //for (var i = 0; i < counter; i++)
                var i = counter;

                {
                    var d = { x: App.lines[i].x2 - App.lines[i].x1, y: App.lines[i].y2 - App.lines[i].y1 };
                    var p0 = { x: App.lines[i].x1, y: App.lines[i].y1 };
                    var p1 = { x: App.lines[i].x1 + d.x * percentage, y: App.lines[i].y1 + d.y * percentage};
                    var p2 = { x: App.lines[i].x1 + d.x * (1.0 - percentage), y: App.lines[i].y1 + d.y * (1.0 - percentage) };
                    var p3 = { x: App.lines[i].x1 + d.x * 1.0, y: App.lines[i].y1 + d.y * 1.0 };

                    var grad01 = App.imageCanvas.GetContext()!.createLinearGradient(p0.x, p0.y, p1.x, p1.y);
                    grad01.addColorStop(0, "rgba(0, 0, 0, 0.0)");
                    grad01.addColorStop(1, "rgba(0, 0, 0, " + App.alpha + ")");

                    var grad12 = App.imageCanvas.GetContext()!.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
                    grad12.addColorStop(0, "rgba(0, 0, 0, " + App.alpha + ")");
                    grad12.addColorStop(0.5, "rgba(0, 0, 0, " + App.alpha + ")");
                    grad12.addColorStop(1, "rgba(0, 0, 0, " + App.alpha + ")");
                    
                    var grad23 = App.imageCanvas.GetContext()!.createLinearGradient(p2.x, p2.y, p3.x, p3.y);
                    grad23.addColorStop(0, "rgba(0, 0, 0, " + App.alpha + ")");
                    grad23.addColorStop(1, "rgba(0, 0, 0, 0.0)");

                    App.alpha = (App.lines[i].value / max) * alphaMax;

                    App.imageCanvas.GetContext()!.beginPath();
                    App.imageCanvas.GetContext()!.moveTo(p0.x, p0.y);
                    App.imageCanvas.GetContext()!.lineTo(p1.x, p1.y);
                    App.imageCanvas.GetContext()!.lineWidth = 1;
                    App.imageCanvas.GetContext()!.strokeStyle = grad01;
                    App.imageCanvas.GetContext()!.stroke();

                    App.imageCanvas.GetContext()!.beginPath();
                    App.imageCanvas.GetContext()!.moveTo(p1.x, p1.y);
                    App.imageCanvas.GetContext()!.lineTo(p2.x, p2.y);
                    App.imageCanvas.GetContext()!.lineWidth = 1;
                    App.imageCanvas.GetContext()!.strokeStyle = grad12;
                    App.imageCanvas.GetContext()!.stroke();

                    App.imageCanvas.GetContext()!.beginPath();
                    App.imageCanvas.GetContext()!.moveTo(p2.x, p2.y);
                    App.imageCanvas.GetContext()!.lineTo(p3.x, p3.y);
                    App.imageCanvas.GetContext()!.lineWidth = 1;
                    App.imageCanvas.GetContext()!.strokeStyle = grad23;
                    App.imageCanvas.GetContext()!.stroke();

                    //App.alpha -= alphaStep;

                    /*App.imageCanvas.GetContext()!.beginPath();
                    App.imageCanvas.GetContext()!.moveTo(App.lines[i].x1, App.lines[i].y1);
                    App.imageCanvas.GetContext()!.lineTo(App.lines[i].x2, App.lines[i].y2);
                    App.imageCanvas.GetContext()!.lineWidth = 1;
                    App.imageCanvas.GetContext()!.strokeStyle = 'rgba(0, 0, 0, ' + alpha + ')';
                    App.imageCanvas.GetContext()!.stroke();*/
                }
                
                /*for (var i = 0; i < 5; i++)
                {
                    var alpha = 1.0 - i * 0.2;

                    App.imageCanvas.GetContext()!.beginPath();
                    App.imageCanvas.GetContext()!.moveTo(0 + i, 0 + i);
                    App.imageCanvas.GetContext()!.lineTo(700 - i, 0 + i);
                    App.imageCanvas.GetContext()!.lineTo(700 - i, 700 - i);
                    App.imageCanvas.GetContext()!.lineTo(0 + i, 700 - i);
                    App.imageCanvas.GetContext()!.lineTo(0 + i, 0 + i);
                    App.imageCanvas.GetContext()!.lineWidth = 1;
                    App.imageCanvas.GetContext()!.strokeStyle = 'rgba(255, 255, 255, 0.01)';
                    App.imageCanvas.GetContext()!.stroke()
                }*/

                App.lineCounter++;
            }
        }
    }

    private async SaveFile()
    {
        var blob: string = "";

        var count = 1000;

        if (App.lines.length < count)
        {
            count = App.lines.length;
        }

        for (var i: number = 0; i < count; i++)
        {
            blob += App.lines[i].value.toFixed(6) + "f,\n";
        }
        
        for (var i: number = 0; i < count; i++)
        {
            blob += (App.lines[i].x1 / App.image.GetWidth()).toFixed(6).toString() + "f, " + (App.lines[i].y1 / App.image.GetWidth()).toFixed(6).toString() + "f,\n";
            blob += (App.lines[i].x2 / App.image.GetWidth()).toFixed(6).toString() + "f, " + (App.lines[i].y2 / App.image.GetWidth()).toFixed(6).toString() + "f,\n";
        }


            /*blob += App.lines[i].value + ";" + 
                (App.lines[i].x1 / App.image.GetWidth()).toString() + ";" +
                (App.lines[i].y1 / App.image.GetHeight()).toString() + ";" +
                (App.lines[i].x2 / App.image.GetWidth()).toString() + ";" +
                (App.lines[i].y2 / App.image.GetHeight()).toString() + ";";*/
        
        var fileHandle: any;
        fileHandle = await (window as any).showSaveFilePicker({ types: [{ description: 'Text file', accept: {'text/plain': ['.txt']}}]});
        const file = await fileHandle.createWritable();
        await file.write(blob);
        await file.close();

        console.log("SaveFile");
    }
}