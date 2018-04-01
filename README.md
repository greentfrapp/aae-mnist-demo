# aae-mnist-demo

Run the following commands to install and start the demo (may take a few minutes depending on your network speed).

```
npm install
```
There may be some warning messages but it should be fine.

Then, run the command:

```
python3 -m server
```
and wait for the following to appear

```
* Running on http://0.0.0.0:8081/ (Press CTRL+C to quit)
```

Finally, open `index.html` in your browser and then click on the red power button.

<img src="https://raw.githubusercontent.com/greentfrapp/aae-mnist-demo/master/images/start.png" alt="Start screen" width="800px" height="whatever">

*Click on the bright red power button!*

<img src="https://raw.githubusercontent.com/greentfrapp/aae-mnist-demo/master/images/loaded.png" alt="Start screen" width="800px" height="whatever">

*After loading the pretrained model, the graph should automatically load the MNIST images. This might take some time depending on your hardware.*

Hover around the points to see the corresponding MNIST image on the right. You can also enter new 2D-coordinates in the PCA input box and click Sample New to see what image that coordinate maps to.
