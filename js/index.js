let net;

const c = document.getElementById('myCanvas');

async function handleFiles(files) {
  console.log('Handling Files..');
  $('#btn-predict').hide();
  $('.loader').show();

  // Load the model
  console.log('Loading coco-ssd..');
  net = await cocoSsd.load();
  console.log('Sucessfully loaded model');
  
  $('.loader').hide();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    if (!file.type.startsWith('image/')){ continue }
    
    const reader = new FileReader();
    reader.onload = function(e) {
      console.log("reader onload");
      var image = new Image();
      image.src = e.target.result;

      image.onload = function (imageEvent) {
        console.log("image onload");
        
        const width = window.screen.availWidth / 2;
        const scaleFactor = width / image.width;

        c.width = width
        c.height = this.height * scaleFactor;
        var ctx = c.getContext("2d");
        ctx.drawImage(image, 0, 0, width, this.height * scaleFactor);
        $('.img-preview').css("width", width);
        $('.img-preview').css("height", this.height * scaleFactor);
      }
    };
    reader.readAsDataURL(file);
  }

  $('.image-section').show();
  $('#btn-predict').show();
} 

async function predict() {
  // Make a prediction through the model on our image.
  const result = await net.detect(c);
  console.log(result);
  $('.loader').hide();
  $('#result').fadeIn(600);
  $('#result').text(result[0].class + ' with ' + (result[0].score*100).toFixed(2) + '% probability.');
  paintBoxes(result);
}

async function app() {
  // Init
  //$('.image-section').hide();
  //$('.loader').hide();
  //$('#result').hide();
  document.getElementById("btn-predict").onclick = predict;

  const fileSelect = document.getElementById("btn-fileSelect"),
  fileElem = document.getElementById("fileElem");

  fileSelect.addEventListener("click", function (e) {
    if (fileElem) {
      fileElem.click();
    }
  }, false);
}

function paintBoxes(result) {
  // dras the bounding boxes
  const context = c.getContext('2d');
  context.font = '10px Arial';

  console.log('number of detections: ', result.length);
  for (let i = 0; i < result.length; i++) {
    context.beginPath();
    context.rect(...result[i].bbox);
    context.lineWidth = 1;
    context.strokeStyle = 'green';
    context.fillStyle = 'green';
    context.stroke();
    context.fillText(
        result[i].score.toFixed(3) + ' ' + result[i].class, result[i].bbox[0],
        result[i].bbox[1] > 10 ? result[i].bbox[1] - 5 : 10);
  }
}

app();
