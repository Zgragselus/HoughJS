<!doctype html>
<html lang="en" translate="no">
<head>
    <title>Otte.cz - Software and Game development</title>

    <meta charset="utf-8">
    <meta name="description" content="Hough transform of uploaded images.">
    <meta name="author" content="OtteIT s.r.o.">
    <meta name="keywords" content="image,processing,hough,transform">
    <meta name="robots" content="index, follow"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons"/>
    <link rel="stylesheet" href="css/materialize.min.css" media="screen"/>
    <link rel="stylesheet" href="style.{APP_VERSION}.css" media="screen"/>

    <script src="marked.js"></script>
    
    <script src="js/jquery.min.js"></script>
    <script src="js/materialize.min.js"></script>
    <script src="js/paho-mqtt.js"></script>
    <script data-main="{APP_JS_FILE}" src="require.js"></script>
</head>
<body>
    <div id="progress" class="progress" style="margin: 0; padding: 0; display: block; position: fixed;">
        <div class="determinate" style="width: 0%"></div>
    </div>
    <div id="main">
    </div>
    <div id="version" style="text-align: right; font-size: 10px; margin: 1rem;">v{APP_VERSION}</div>
    <script>
        var app = null;

        require.config({
            paths: {
                'materialize-css': 'js/materialize.min',
                'jquery': 'js/jquery.min'
            },
            shim: {
                'materialize-css': {
                    deps: ['jquery']
                }
            }
        });

        requirejs(['app'], function(Main)
        {
            app = new Main.App(document.getElementById('main'));
        });
    </script>
</body>
</html>
