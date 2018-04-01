import Vue from "vue";
import Element from 'element-ui'
import myApi from './gateways/myApi.js';
import Chart from "chart.js"
import * as $ from 'jquery';

window.onload=function(){

var latentData = []
var latentMagData = []
var imageData = []
var scatterChartData = {
  datasets: []
}
var ctx = document.createElement('canvas').getContext('2d');
var myScatter = Chart.Scatter(ctx, {
        data: scatterChartData,
    });

var colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf", "#000000"];

function magnitude(vector) {
  var magnitude = 0.0
  for (var i = 0; i < vector.length; i++) {
    magnitude += vector[i] ** 2
  }
  return Math.round(magnitude ** 0.5 * 10) / 10.0
}

function scaleImageData(imageData, width, height, scale_x, scale_y) {
  var buffer = new Uint8ClampedArray(width * scale_x * height * scale_y);
  var position = 0;
  while (position < imageData.length / 4) {
    for(var y = 0; y < scale_y; y++) {
      for(var x = 0; x < scale_x; x++) {
        var scaled_pos = ((position % (width / 4)) * scale_x * 4) + (Math.floor(position / (width / 4)) * width * scale_x * scale_y) + (x * 4) + (y * width * scale_x)
        for(var i = 0; i < 4; i++) {
          buffer[scaled_pos + i] = imageData[position * 4 + i];
        }
      }
    }
    position++;
  }
  return buffer
}

function customTooltip(tooltipModel) {
  var pcaInput = <HTMLInputElement> document.getElementById("pcaVector");
  var latentInput = <HTMLInputElement> document.getElementById("latentVector");
  var latentMagInput = <HTMLInputElement> document.getElementById("latentVectorMag");
  var x = parseFloat(tooltipModel.dataPoints[0].xLabel);
  var y = parseFloat(tooltipModel.dataPoints[0].yLabel);
  var datasetIdx = tooltipModel.dataPoints[0].datasetIndex;
  var dataIdx = tooltipModel.dataPoints[0].index;
  pcaInput.value = "[" + (Math.round(x * 100) / 100).toString() + ", " + (Math.round(y * 100) / 100).toString() + "]";

  if (latentData[datasetIdx][dataIdx].length == 4) {
    var latentVectors = latentData[datasetIdx][dataIdx];
    var latentVectorsString = "";
    var latentMagsString = "";
    for (var i = 0; i < latentVectors.length; i++) {
      var latentVector = latentVectors[i];
      var latentVectorString = "[";
      for (var j = 0; j < latentVector.length; j++) {
        latentVectorString += (Math.round(latentVector[j] * 10) / 10).toString();
        if (j < latentVector.length - 1) {
          latentVectorString += ", ";
        }
      }
      latentVectorString += "]";
      latentVectorsString += latentVectorString
      latentMagsString += magnitude(latentVector).toString();
      if (i < latentVectors.length - 1) {
        latentVectorsString += ", ";
        latentMagsString += ", "
      }
    }
    latentInput.value = latentVectorsString;
    latentMagInput.value = latentMagsString;


    var img_width = 56;
    var img_height = 56;
    var scale_width = 5;
    var scale_height = 5;
    var image_vector = imageData[datasetIdx][dataIdx];
    var buffer = scaleImageData(image_vector, img_width * 4, img_height, scale_width, scale_height);
    var canvasImage = <HTMLCanvasElement> document.getElementById("image");
    var ctxImage = canvasImage.getContext('2d');
    var imgdata = ctxImage.createImageData(img_width * scale_width, img_height * scale_height);
    imgdata.data.set(buffer);
    ctxImage.putImageData(imgdata, 0, 0);
  } else {
    var latentVector = latentData[datasetIdx][dataIdx];
    var latentVectorString = "[";
    for (var i = 0; i < latentVector.length; i++) {
      latentVectorString += (Math.round(latentVector[i] * 10) / 10).toString();
      if (i < latentVector.length - 1) {
        latentVectorString += ", ";
      }
    }
    latentVectorString += "]";
    latentInput.value = latentVectorString;
    latentMagInput.value = magnitude(latentVector).toString();
  
    var img_width = 28;
    var img_height = 28;
    var scale_width = 10;
    var scale_height = 10;
    var image_vector = imageData[datasetIdx][dataIdx];
    var buffer = scaleImageData(image_vector, img_width * 4, img_height, scale_width, scale_height);
    var canvasImage = <HTMLCanvasElement> document.getElementById("image");
    var ctxImage = canvasImage.getContext('2d');
    var imgdata = ctxImage.createImageData(img_width * scale_width, img_height * scale_height);
    imgdata.data.set(buffer);
    ctxImage.putImageData(imgdata, 0, 0);
  }
}

setTimeout(function(){
  Vue.component('main-interface', {
    template: '#main-template',
    data: function() {
      return {
        modelLoaded: false,
        loading : false,
        latentData: [],
        latentMagData: [],
        imageData: [],
        myScatter : myScatter,
        scatterChartData : scatterChartData,
        colors : colors,
        latentInput: "",
        latentMagInput: "",
        pcaInput: ""
      }
    },
    mounted: function() {
      myApi.get('is_model_loaded?').then(response =>  {
        this.modelLoaded = response.data;
      })
      // initialize image canvas
      var width = 28,
      height = 28,
      scale_width = 10,
      scale_height = 10,
      prebuffer = Array.apply(null, Array(width * height * 4)).map(Number.prototype.valueOf,230);
      var buffer = scaleImageData(prebuffer, width * 4, height, scale_width, scale_height);
      var canvasImage = <HTMLCanvasElement> document.getElementById("image");
      var ctxImage = canvasImage.getContext('2d');
      canvasImage.width = width * scale_width;
      canvasImage.height = height * scale_height;
      var imgdata = ctxImage.createImageData(width * scale_width, height * scale_height);
      imgdata.data.set(buffer);
      ctxImage.putImageData(imgdata, 0, 0);
      // initialize graph canvas
      var canvas = <HTMLCanvasElement> document.getElementById("graph");
      var ctx = canvas.getContext("2d");
      Chart.defaults.global.defaultFontSize = 16;
      var myScatter = Chart.Scatter(ctx, {
        data: this.scatterChartData,
        options: {
          title: {
            display: true,
            text: 'PCA Mapping of Latent Space'
          },
          legend: {
            labels: {
              boxWidth: 20
            }
          },
          tooltips: {
            enabled: false,
            custom: function(tooltipModel) {
              if (tooltipModel.dataPoints) {
                customTooltip(tooltipModel);
              }
            }
          }
        }
      });
      this.myScatter = myScatter;
  },
  methods: {
    load: function () {
      this.loading = true;
      var newDatasets = [];
      myApi.get('load_model?model=./swagger_server/assets/models/saved_models/').then(response =>  {
        for (var i = 0; i < 10; i++) {
          var label = response.data[i].label;
          var data = response.data[i].pca_points.points;
          var newDataset = {label: label, borderColor: colors[i], backgroundColor: colors[i], data: data};
          newDatasets.push(newDataset);
          this.imageData.push(response.data[i].img_points);
          this.latentData.push(response.data[i].latent_points);
          var magData = [];
          for (var j = 0; j < response.data[i].latent_points.length; j++) {
            magData.push(magnitude(response.data[i].latent_points[j]));
          }
          this.latentMagData.push(magData)
        }
        this.scatterChartData.datasets = newDatasets;
        this.myScatter.update();
        this.loading = false;
        latentData = this.latentData;
        imageData = this.imageData;
        latentMagData = this.latentMagData;
        this.modelLoaded = true;
      })
    },
    hardRefresh: function () {
      this.loading = true;
      var newDatasets = [];
      this.latentData = [];
      this.latentMagData = []
      this.imageData = [];
      myApi.get('plot_mnist_data?n_data=1000').then(response =>  {
        for (var i = 0; i < 10; i++) {
          var label = response.data[i].label;
          var data = response.data[i].pca_points.points;
          var newDataset = {label: label, borderColor: colors[i], backgroundColor: colors[i], data: data};
          newDatasets.push(newDataset);
          this.imageData.push(response.data[i].img_points);
          this.latentData.push(response.data[i].latent_points);
          var magData = [];
          for (var j = 0; j < response.data[i].latent_points.length; j++) {
            magData.push(magnitude(response.data[i].latent_points[j]));
          }
          this.latentMagData.push(magData)
        }
        this.scatterChartData.datasets = newDatasets;
        this.myScatter.update();
        this.loading = false;
        latentData = this.latentData;
        latentMagData = this.latentMagData;
        imageData = this.imageData;
      })
    },
    softRefresh: function () {
      this.loading = true;
      if (this.latentData.length > 10) {
        this.latentData.shift();
        this.latentMagData.shift();
        this.imageData.shift();
        this.scatterChartData.datasets.shift();
        this.myScatter.update();
        latentData = this.latentData;
        latentMagData = this.latentMagData;
        imageData = this.imageData;
        this.latentInput = "";
        this.pcaInput = "";
        var width = 28,
        height = 28,
        scale_width = 10,
        scale_height = 10,
        prebuffer = Array.apply(null, Array(width * height * 4)).map(Number.prototype.valueOf,230);
        var buffer = scaleImageData(prebuffer, width * 4, height, scale_width, scale_height);
        var canvasImage = <HTMLCanvasElement> document.getElementById("image");
        var ctxImage = canvasImage.getContext('2d');
        canvasImage.width = width * scale_width;
        canvasImage.height = height * scale_height;
        var imgdata = ctxImage.createImageData(width * scale_width, height * scale_height);
        imgdata.data.set(buffer);
        ctxImage.putImageData(imgdata, 0, 0);
      }
      this.loading = false;
    },
    customLatentVector: function () {
      this.loading = true;
      var latentVectorString = this.latentInput.slice(1, -1).split(',');
      var latentVector = [];
      latentVectorString.forEach(function (digit) {
        latentVector.push(parseFloat(digit))
      })
      latentVector = [latentVector]
      myApi.post('latent2data', latentVector).then(response =>  {
        var label = response.data[0].label;
        var data = response.data[0].pca_points.points;
        var newDataset = {label: label, borderColor: "#000000", backgroundColor: "#FFFFFF", data: data, radius: 6, borderWidth: 3};

        this.latentMagInput = magnitude(latentVector[0]).toString();
        this.pcaInput = "[" + (Math.round(data[0].x * 100) / 100).toString() + ", " + (Math.round(data[0].y * 100) / 100).toString() + "]";

        var img_width = 28;
        var img_height = 28;
        var scale_width = 10;
        var scale_height = 10;
        var image_vector = response.data[0].img_points[0];
        var buffer = scaleImageData(image_vector, img_width * 4, img_height, scale_width, scale_height);
        var canvasImage = <HTMLCanvasElement> document.getElementById("image");
        var ctxImage = canvasImage.getContext('2d');
        var imgdata = ctxImage.createImageData(img_width * scale_width, img_height * scale_height);
        imgdata.data.set(buffer);
        ctxImage.putImageData(imgdata, 0, 0);

        var length = this.scatterChartData.datasets.length;
        if (this.scatterChartData.datasets[0].label === "New") {
          for (var i = 0; i < newDataset.data.length; i++) {
            this.scatterChartData.datasets[0].data.push(newDataset.data[i]);
            this.imageData[0].push(response.data[0].img_points[i]);
            this.latentData[0].push(response.data[0].latent_points[i]);
            this.latentMagData[0].push(magnitude(response.data[0].latent_points[i]));
          }
        } else {
          this.scatterChartData.datasets.unshift(newDataset);
          this.imageData.unshift(response.data[0].img_points);
          this.latentData.unshift(response.data[0].latent_points);
          var magData = [];
          for (var j = 0; j < response.data[0].latent_points.length; j++) {
            magData.push(magnitude(response.data[0].latent_points[j]));
          }
          this.latentMagData.unshift(magData);
        }
        
        this.myScatter.update();
        this.loading = false;
        latentData = this.latentData;
        latentMagData = this.latentMagData;
        imageData = this.imageData;
      })
    },
    customPcaVector: function () {
      this.loading = true;
      var pcaVectorString = this.pcaInput.slice(1, -1).split(',');
      var pcaVector = [];
      pcaVectorString.forEach(function (digit) {
        pcaVector.push(parseFloat(digit))
      })
      var pcaVectorObj = {x: pcaVector[0], y: pcaVector[1]};
      myApi.post('pca2data', {points: [pcaVectorObj]}).then(response =>  {
        var label = response.data[0].label;
        var data = response.data[0].pca_points.points;
        var newDataset = {label: label, borderColor: "#000000", backgroundColor: "#FFFFFF", data: data, radius: 6, borderWidth: 3};
        
        var latentVectors = response.data[0].latent_points[0];
        var latentVectorsString = "";
        var latentMagsString = "";
        for (var i = 0; i < latentVectors.length; i++) {
          var latentVector = latentVectors[i];
          var latentVectorString = "[";
          for (var j = 0; j < latentVector.length; j++) {
            latentVectorString += (Math.round(latentVector[j] * 10) / 10).toString();
            if (j < latentVector.length - 1) {
              latentVectorString += ", ";
            }
          }
          latentVectorString += "]";
          latentVectorsString += latentVectorString;
          latentMagsString += magnitude(latentVector).toString();
          if (i < latentVectors.length - 1) {
            latentVectorsString += ", ";
            latentMagsString += ", "
          }
        }
        this.latentInput = latentVectorsString;
        this.latentMagInput = latentMagsString;

        var img_width = 56;
        var img_height = 56;
        var scale_width = 5;
        var scale_height = 5;
        var image_vector = response.data[0].img_points[0];
        var buffer = scaleImageData(image_vector, img_width * 4, img_height, scale_width, scale_height);
        var canvasImage = <HTMLCanvasElement> document.getElementById("image");
        var ctxImage = canvasImage.getContext('2d');
        var imgdata = ctxImage.createImageData(img_width * scale_width, img_height * scale_height);
        imgdata.data.set(buffer);
        ctxImage.putImageData(imgdata, 0, 0);

        var length = this.scatterChartData.datasets.length;
        if (this.scatterChartData.datasets[0].label === "New") {
          for (var i = 0; i < newDataset.data.length; i++) {
            this.scatterChartData.datasets[0].data.push(newDataset.data[i]);
            this.imageData[0].push(response.data[0].img_points[i]);
            this.latentData[0].push(response.data[0].latent_points[i]);
            var subMagData = [];
            for (var j = 0; j < response.data[0].latent_points[i].length; j++) {
              subMagData.push(magnitude(response.data[0].latent_points[i][j]));
            }
            this.latentMagData[0].push(subMagData);
          }
        } else {
          this.scatterChartData.datasets.unshift(newDataset);
          this.imageData.unshift(response.data[0].img_points);
          this.latentData.unshift(response.data[0].latent_points);
          var magData = [];
          for (var i = 0; i <response.data[0].latent_points.length; i++) {
            var subMagData = [];
            for (var j = 0; j < response.data[0].latent_points[i].length; j++) {
              subMagData.push(magnitude(response.data[0].latent_points[i][j]));
            }
            magData.push(subMagData);
          }
          this.latentMagData.unshift(magData);
        }
        this.myScatter.update();
        this.loading = false;
        latentData = this.latentData;
        latentMagData = this.latentMagData;
        imageData = this.imageData;
      })
    }
  }
})

new Vue({
  el: '#interface',
  data: {
    view: 'main-interface',
    show: true
  }
})


}, 200);


}