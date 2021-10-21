let button1;
let button2;
let flag1;
let flag2;
let start;
let movers = [];
let test;
let population;
let lifetime;

let toppercentage;
let networksize;
let csv = [];
let new_genomes;
let generation;
let topfitness = [];

function setup(){
  generation=0;
  csv.push(["Tau_0","Tau_1","Tau_2", "Tau_3","Tau_4","Tau_5","Bias_0","Bias_1","Bias_2","Bias_3","Bias_4","Bias_5",
            "w_(00)","w_(01)","w_(00)","w_(00)","w_(00)","w_(00)",
            "w_(10)","w_(11)","w_(12)","w_(13)","w_(14)","w_(15)",
            "w_(20)","w_(21)","w_(22)","w_(23)","w_(24)","w_(25)",
            "w_(30)","w_(31)","w_(32)","w_(33)","w_(34)","w_(35)",
            "w_(40)","w_(41)","w_(42)","w_(43)","w_(44)","w_(45)",
            "w_(50)","w_(51)","w_(52)","w_(53)","w_(54)","w_(55)","fitness", "generation"
            ]);

  createCanvas(3000, 2000);
  button1 = createButton('Save Data');
  button1.position(0,0);
  button1.mousePressed(savecsv);
  angleMode(DEGREES);
  flag1= createVector(450,1180);
  flag2 = createVector(2200,1200);
  start = createVector(625,150);
  population = 100;
  toppercentage = 5;

  lifetime = 0;
  networksize = 6;

  genomes = [];
  for(let i=0;i<population;i++){
    genomes.push(initializeGenome(networksize));
    movers.push(new Mover(start.x,start.y,networksize,genomes[i]));
    movers[i].mutate();
    movers[i].modifyParameters();
    movers[i].network.initializeState(0);
  }
  //console.log(movers[0].sensors)
}
function draw() {
  background(0);
  translate(0,windowHeight);
  scale(1,-1);
  stroke(255);
  rect(450, 0, 500, 1600); //vertical bar
  rect(950, 1200, 1600, 400); //horizontal bar
  stroke(200,0,0);
  strokeWeight(20);
  line(flag1.x,flag1.y,flag1.x+500, flag1.y);
  line(flag2.x,flag2.y,flag2.x, flag2.y+400);
  fit = 0;
  for(var i=0;i<population;i++){
//    if(i==0){
//     print(movers[i].angle, movers[i].r);
//    }
    movers[i].show();
    movers[i].calculateDistance();
    movers[i].updateAgent(0.02);
    movers[i].calculateFitness();
    fit+=movers[i].fitness;
  }
  var count = 0;
  var mag =0
  for(var i=0;i<population;i++){
    mag+=movers[i].velocity.mag();
  }
  if(mag/population<3 && lifetime>50){
    //add all genomes to csv
    for(var i=0;i<movers.length;i++){
      temp_genome = movers[i].dna;
      temp_genome = temp_genome.concat(movers[i].fitness);
      temp_genome = temp_genome.concat(generation);
      csv.push(temp_genome);

    }
    topfitness =movers.sort(compare).slice(-int(population*(1/toppercentage)));
    var avetopfit = 0;
    for(var i=0;i<topfitness.length;i++){
      avetopfit+=topfitness[i].fitness;
    }
    print(fit/population,avetopfit/topfitness.length);




    //if(generation==2){noLoop();}
    new_genomes = [];
//    for(var i=0; i<topfitness.length;i++){
//      new_genomes.push(topfitness[i].dna);
//    for(var j=0;j<new_genomes[i].length;j++){
//         new_genomes[i][j]= topfitness[int(random(0,topfitness.length))].dna[j];
//      }
//    }

    for(var i=0; i<topfitness.length;i++){
      new_genomes.push(topfitness[i].dna);
      for(j=0;j<new_genomes[i].length;j++){
        new_genomes[i][j]=topfitness[int(random(topfitness.length))].dna[j]
}
    }

    movers = [];
    lifetime=0;
      for(var i=0;i<population;i++){
        movers.push(new Mover(start.x,start.y,networksize,new_genomes[int(random(new_genomes.length))]));
        movers[i].mutate();
        movers[i].modifyParameters();
        movers[i].network.initializeState(0);
      }
    generation++;

  }
  lifetime++;
}

class Mover{
  constructor(x, y, networksize, dna){
    this.networksize = networksize;
    this.location = createVector(x,y);
    this.velocity= createVector(0,0);
    this.acceleration = createVector(0,0);
    this.mass = 20;
    this.radius = sqrt(this.mass)*10;
    this.dna = dna;
    this.network = new CTRNN(networksize);
    this.sensors = new Matrix(4,1, 0);
    this.checkpoint = false;
    this.fitness = 0;
    this.color = createVector(int(random(100, 255)),int(random(100, 255)),int( random(100, 255)));
    this.angle = 0;
    this.r =0;
  }

  calculateFitness(){
    if(this.location.y<flag1.y){
      this.fitness = 0.5*(1-flag1.y-this.location.y)/(flag1.y-start.y);

    }else{
      if(this.location.x<flag2.x){
      this.fitness = 1-0.5*(flag2.x-this.location.x)/(flag2.x-flag1.x);
      }
      else{
        this.fitness = 1;
      }
      if(this.fitness==1){
        this.fitness += 1/lifetime
}
    }
}
  show(){
    stroke(0);
    fill(this.color.x, this.color.y, this.color.z);

    circle(this.location.x, this.location.y, this.radius );
    fill(255,255,255)
  }
  updateInput(dt){
    for(var i=0;i<this.networksize; i++){
      this.network.inputs.set(i,0,this.sensors[i]);
      this.network.step(dt)
    }
  }
  updateAgent(dt){
    this.updateInput(dt);
    //this.angle = 360 * this.network.outputs.get(4,0);
    //this.r = this.network.outputs.get(5,0)

    this.velocity.add(createVector(this.network.outputs.get(4,0), this.network.outputs.get(5,0)));
    this.velocity.add(createVector(this.r * sin(this.angle), this.r*cos(this.angle)));
    this.location.add(this.velocity);
    this.acceleration = createVector(0,0);
    this.checkEdges();
  }

  calculateDistance(){
    this.sensors[0] = (1600-this.location.y)/1600; //upper bound
    this.sensors[2] = abs(450-this.location.x)/450 //left bound
    if (this.location.y<1600){
      this.sensors[1] = this.location.y/1600; //lower bound
      this.sensors[3] = abs(950-this.location.x)/950; //right bound

    } else{
      this.sensors[1] = abs(1200- this.location.y)/1200; //lower bound
      this.sensors[3] = abs(2550-this.location.x)/2550; //right bound
    }
  }




    applyForce(force){
    let f = p5.Vector.div(force, this.mass);
    this.acceleration.add(f)
  }

  checkEdges() {
    if (this.location.y >= 1600) {
      this.location.y = 1600;
      this.velocity.y *= -.2;
      this.velocity.x *= .9;
//      this.fitness -= .1;
    }
    if (this.location.y<20){
      this.location.y = 25;
      this.velocity.y *= -.2;
      this.velocity.x *= .9;
//      this.fitness -= .1;
    }else if (this.location.x>950 && this.location.y<=1200){
      this.location.x = 950;
      this.velocity.x *= -.8;
      this.velocity.y *= .9;
//      this.fitness -= .1;
    } if(this.location.x<450){
      this.location.x = 450;
      this.velocity.x *= -.2;
      this.velocity.y *= .9;
//      this.fitness -= .1;
    } else if(this.location.y< 1200 && this.location.x>950){
      this.location.y = 1200;
      this.velocity.y *= -.2;
      this.velocity.x *= .9;
//      this.fitness -= .1;
    } else if(this.location.x>2550 && this.location.y>1200){
      this.location.x = 2550;
      this.velocity.x *=-.2;
      this.velocity.y *= .9;
//     this.fitness -= .1;
    }
  }

  modifyParameters(){
     for(var i=0;i<this.networksize; i++){
       this.network.timeConstants.set(i,0, this.dna[i]);
       this.network.invTimeConstants.set(i,0, 1/this.dna[i]);

      }

    for(var i=0;i<this.networksize;i++){
      this.network.biases.set(i,0, this.dna[this.networksize+i]);
      }

      for(var i=0;i<this.networksize;i++){
        for (var j=0;j<this.networksize;j++){
          this.network.weights.set(i,j, this.dna[2*this.networksize+i*this.networksize+j]);
        }
      }

  }

  mutate(){
    for (var i=0;i<this.dna.length;i++){
      if(random(1)<0.3){
        this.dna[i]+= randomGaussian(0,2);
      }
      if(random(1)<.1){
        this.dna[i]*=-1.2
      }
    }
  }
}

class CTRNN {
  constructor(size){
    this.size = size;
    this.states = new Matrix(size,1,  0);
    this.timeConstants = new Matrix(size,1, 1);
    this.invTimeConstants= new Matrix(size,1, 1);
    this.biases = new Matrix(size,1, 0);
    this.weights = new Matrix(size,size,0);
    this.outputs = new Matrix(size,1,0);
    this.inputs = new Matrix(size,1,  0);
  }
  initializeState(v){
    for(var i=0;i<this.size;i++){
      this.states.set(i,0,v);
      this.outputs.set(i,0,sigmoid(this.states.get(i,0)+this.biases.get(i,0)));
    }
  }
  step(dt){
    var netinput = new Matrix(this.inputs.cols, this.inputs.rows, 0);

    netinput = Matrix.dot(this.weights.transpose(), this.outputs);
    netinput.add(this.inputs);
    for(var i=0;i<this.size;i++){
      this.states.add(this.invTimeConstants.multiply(this.states.add(netinput)))
    }
    return this.states

  }

}

function initializeGenome(size){
  arr = new Array();
  for(var i=0;i<2*size+size*size;i++){
    if(i<size){
      arr[i] = random(0.1,5);
    } else
      arr[i] = random(-10,10);


  }
  return arr
}
function sigmoid(x){
  return 1/(1+pow(Math.E, -x));

}
function compare(a,b){
  if (a.fitness < b.fitness){
    return -1;
  }
  if(a.fitness > b.fitness){
    return 1
  }
  return 0;
}
function savecsv(){

  let csvContent = "data:text/csv;charset=utf-8,";
  csv.forEach(function(rowArray){
    let row = rowArray.join(",");
    csvContent+= row + "\r\n";
  });
  var encodedUri= encodeURI(csvContent);
  window.open(encodedUri);
}
