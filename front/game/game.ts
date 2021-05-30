// import { BootScene } from './scene'

const createGame = (config: Phaser.Types.Core.GameConfig = {}) =>
  new Phaser.Game({
    parent: 'phaser',
    type: Phaser.WEBGL,
    width: 700,
    height: 400,
    backgroundColor: '#111927',
    pixelArt: true,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: {y: 0 },
        debug: true
      }
    },
    scene: {
      preload: preload,
      create: create,
      update: update
    },
    ...config,
  })


let pad1
let pad2
let ball

let cursors
let speed

let keyA
let keyZ

let logo

function preload ()
{

  // this.load.setBaseURL('https://www.pngfind.com');
  //
  // this.load.image('sky', 'pngs/m/123-1230253_pokeball-icon-png-pokeball-png-transparent-png.png');
  // logo = this.load.image('logo', 'originals/44/44/ea/4444eaf1bcaae579f7f2dfbb9a80536e.jpg');
  // this.load.image('red', 'assets/particles/red.png');
}

function create ()
{
  // this.physics.world.setBounds(0, 0, 700, 400);

  pad1 = this.add.rectangle(10, 10, 10, 100, 0x6666ff)
  pad2 = this.add.rectangle(690, 10, 10, 100, 0x6666ff)

  // let r1 = this.add.circle(0, 0, 7, 0x6666ff);

  ball = this.physics.add.image(0, 0, null)

  ball.setCircle(7)
  ball.setCollideWorldBounds(true);
  ball.setBounce(1);
  ball.setVelocity(150);

  this.physics.add.existing(pad1, false);
  pad1.body.setCollideWorldBounds(true);
  this.physics.add.existing(pad2, false);
  pad2.body.setCollideWorldBounds(true);

  this.physics.add.collider(pad1, pad2);

  keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  keyZ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);

  cursors = this.input.keyboard.createCursorKeys();

  speed = Phaser.Math.GetSpeed(300, 1)

}

function update (time, delta)
{
  if (cursors.up.isDown)
    pad1.y -= speed * delta;
  else if (cursors.down.isDown)
    pad1.y += speed * delta;
  if (keyA.isDown)
    pad2.y += speed * delta;
  if (keyZ.isDown)
    pad2.y -= speed * delta;

}


export default createGame
