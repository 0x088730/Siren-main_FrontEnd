const avatarList = [1, 2, 3, 4]

const weaponList = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const stockTypes = [
  'loot',
  'gem_1',
  'infernal_1',
  'chimera_1',
  'gem_2',
  'infernal_2',
  'chimera_2',
  'gem_3',
  'infernal_3',
  'chimera_3',
]

import { StockProps } from '../common/state/game/state'
import { SIREN_SPINE } from '../config/const'
import StockItem from '../objects/stockItem'
import { changeItem, global } from '../common/global'
import { createCharacterAnims } from '../anims/CharacterAnims'
import {
  energySwap,
  getProfile,
  itemModify,
  itemRevive,
  setCurrentCharacter,
} from '../common/api'

export default class CharacterWidget extends Phaser.GameObjects.Container {
  scene: Phaser.Scene
  background: Phaser.GameObjects.Image
  modelBackground: Phaser.GameObjects.Image
  closeBtn: Phaser.GameObjects.Image
  model: Array<Phaser.GameObjects.Image> = []
  weapon: Array<Phaser.GameObjects.Image> = []
  gem: Phaser.Structs.List<StockItem>
  embedGem: Phaser.Structs.List<Phaser.GameObjects.Image>
  sirenSpine!: SpineGameObject
  siren3!: Phaser.GameObjects.Sprite
  addWeapon!: Phaser.GameObjects.Image
  addGem!: Phaser.GameObjects.Image
  addEnergy!: Phaser.GameObjects.Image
  inventory_frame!: Phaser.GameObjects.Image
  health!: Phaser.GameObjects.Text
  critical!: Phaser.GameObjects.Text
  energy!: Phaser.GameObjects.Text
  levelLabel!: Phaser.GameObjects.Text
  expLabel!: Phaser.GameObjects.Text
  energySwapEdit!: Phaser.GameObjects.DOMElement
  energySwapText!: Phaser.GameObjects.Text
  energySwapText1!: Phaser.GameObjects.Text
  waterText!: Phaser.GameObjects.Text
  waterText1!: Phaser.GameObjects.Text
  waterText2!: Phaser.GameObjects.Text
  swapAmount!: Number
  swapBtn!: Phaser.GameObjects.Image
  rarityTexts: Phaser.GameObjects.Text[] = []
  lvTexts: Phaser.GameObjects.Text[] = []
  private avatarTween: Array<Phaser.Tweens.Tween> = []
  private weaponTween: Array<Phaser.Tweens.Tween> = []
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y)
    this.scene = scene
    this.add(
      (this.background = scene.add
        .image(270, 0, 'character1-frame')
        .setDisplaySize(700, 700)),
    )
    this.add(
      (this.modelBackground = scene.add
        .image(-480, 0, 'character-model-bg')
        .setDisplaySize(800, 700)),
    )
    this.add(
      (this.addGem = scene.add
        .image(-240, -65, 'add-gem')
        .setDisplaySize(192, 69))
        .setInteractive()
        .on('pointerdown', () => {
          this.sceneMode(4)
        }),
    )
    this.add(
      (this.addEnergy = scene.add
        .image(-770, -300, 'add-energy')
        .setDisplaySize(138, 47))
        .setInteractive()
        .on('pointerdown', () => {
          this.sceneMode(5)
        }),
    )
    this.add(
      (this.addWeapon = scene.add
        .image(-240, 105, 'add-weapon')
        .setDisplaySize(192, 69))
        .setInteractive()
        .on('pointerdown', () => {
          this.sceneMode(3)
        }),
    )
    this.add(
      (this.health = this.scene.add.text(-232, -173, `${1000}`, {
        font: '17px Anime Ace',
        color: '#ffffff',
      })),
    )
    this.add(
      (this.critical = this.scene.add.text(-232, -266, `10%`, {
        font: '17px Anime Ace',
        color: '#ffffff',
      })),
    )
    this.add(
      (this.energy = this.scene.add.text(-785, -307, `${global.energy}`, {
        font: '17px Anime Ace',
        color: '#ffffff',
      })),
    )
    this.add(
      (this.levelLabel = this.scene.add
        .text(-578, -250, `${1}`, { font: '90px Anime Ace', color: '#e62b2b' })
        .setOrigin(0.5, 0.5)),
    )
    this.add(
      (this.expLabel = this.scene.add
        .text(-570, -159, `40/100`, {
          font: '20px Anime Ace',
          color: '#ffffff',
        })
        .setOrigin(0.5, 0.5)),
    )

    this.modelBackground.setVisible(false)
    this.add(
      (this.closeBtn = scene.add
        .image(605, -335, 'close-btn')
        .setInteractive()
        .setScale(0.5)
        .on('pointerdown', () => {
          this.sirenSpine.setVisible(false)
          this.siren3.stop()
          this.siren3.setVisible(false)
          this.setVisible(false)
          for(let i=0; i < this.rarityTexts.length; i++){
            this.rarityTexts[i].setVisible(false)
            this.lvTexts[i].setVisible(false)
          }
          this.remove(this.lvTexts)
          this.remove(this.rarityTexts)
          this.lvTexts = []
          this.rarityTexts = []
          this.emit('closed')
        })),
    )
    for (let i = 0; i < avatarList.length; i++) {
      const row = Math.floor(i % 2)
      const col = Math.floor(i / 2)

      this.add(
        (this.model[i] = scene.add
          .image(row * 220 + 80, col * 220 - 220, `model1-${avatarList[i]}`) //
          .setDisplaySize(220, 220)
          .setInteractive()),
      )
      // this.add(
      //   (this.model[i] = scene.add

      //     .setDisplaySize(180, 180)
      //     .setInteractive()),
      // )
      // this.avatarTween[i] = scene.tweens.add({
      //   duration: 1000,
      //   repeat: -1,
      //   ease: 'Power1',
      //   paused: true,
      //   scaleX: 0.3,
      //   scaleY: 0.3,
      //   targets: this.model[i],
      //   yoyo: true,
      // })
      // this.avatarTween[i].play()
    }

    for (let i = 0; i < weaponList.length; i++) {
      const row = Math.floor(i % 3)
      const col = Math.floor(i / 3)

      this.add(
        (this.weapon[i] = scene.add
          .image(row * 200 + 60, col * 200 - 200, `weapon-${weaponList[i]}`)
          .setDisplaySize(200, 200)
          .setInteractive()
          .on('pointerdown', () => {})),
      )
      this.weaponTween[i] = scene.tweens.add({
        duration: 800,
        repeat: -1,
        ease: 'Power1',
        paused: true,
        scaleX: 0.5,
        scaleY: 0.5,
        targets: this.weapon[i],
        yoyo: true,
      })
      this.weaponTween[i].play()
    }

    this.add(
      (this.energySwapEdit = this.scene.add.dom(295, -50, 'input', {
        type: 'number',
        value: '0',
        pattern: '[0-9]*',
        fontSize: '32px',
        backgroundColor: '#fff',
        color: '#000',
        padding: '8px',
        borderRadius: '8px',
        width: '100px',
        fontFamily: 'Anime Ace',
        textAlign: 'center',
      })),
    )

    const inputElement = this.energySwapEdit.node as HTMLInputElement

    inputElement.addEventListener('input', () => {
      this.swapAmount = parseInt(inputElement.value, 10)
    })

    this.add(
      (this.waterText = this.scene.add
        .text(150, -140, `${'YOU HAVE:'}`, {
          font: '30px Anime Ace',
          color: '#fff',
          stroke: '#000',
          strokeThickness: 4,
        })
        .setOrigin(0.5, 0.5)),
    )
    this.add(
      (this.waterText1 = this.scene.add
        .text(320, -140, `${global.resource}`, {
          font: '30px Anime Ace',
          color: '#00c7df',
          stroke: '#000',
          strokeThickness: 4,
        })
        .setOrigin(0.5, 0.5)),
    )
    this.add(
      (this.waterText2 = this.scene.add
        .text(450, -140, `${'WATER'}`, {
          font: '30px Anime Ace',
          color: '#fff',
          stroke: '#000',
          strokeThickness: 4,
        })
        .setOrigin(0.5, 0.5)),
    )

    this.add(
      (this.energySwapText = this.scene.add
        .text(260, 120, `${'WATER IS DRAWN FROM WELLS ON YOUR'}`, {
          font: '18px Anime Ace',
          color: '#fff',
          stroke: '#000',
          strokeThickness: 4,
        })
        .setOrigin(0.5, 0.5)),
    )

    this.add(
      (this.energySwapText1 = this.scene.add
        .text(520, 120, `${'LAND'}`, {
          font: '18px Anime Ace',
          color: '#9292f8',
          stroke: '#000',
          strokeThickness: 4,
        })
        .setOrigin(0.5, 0.5)),
    )

    this.add(
      (this.swapBtn = scene.add
        .image(300, 25, 'swap-btn')
        .setDisplaySize(118, 46))
        .setInteractive()
        .on('pointerdown', () => {
          if (this.swapAmount === undefined) {
            return
          }
          if (global.resource < this.swapAmount) {
            alert('Water is less than Swap Amount!!!')
            return
          }
          energySwap(
            global.walletAddress,
            global.currentCharacterName,
            this.swapAmount,
            (resp: any) => {
              global.energy = resp.energy
              global.resource = resp.resource
              this.energy.setText(`${global.energy}`)
              this.waterText1.setText(`${global.resource}`)
            },
          )
        }),
    )

    this.gem = new Phaser.Structs.List<StockItem>(null)
    this.embedGem = new Phaser.Structs.List<Phaser.GameObjects.Image>(null)
    this.gemBuild()
    this.embedBuild()
    this.setVisible(false)
    scene.add.existing(this)
    this.sirenSpine = this.scene.add
      .spine(280, 765, SIREN_SPINE, 'Idle', true)
      .setScale(0.25)
    this.sirenSpine.setVisible(false)
    this.siren3 = this.scene.add
      .sprite(486, 500, 'siren-3')
      .setScale(0.7, 0.7)
      .setPosition(300, 550)
    this.siren3.setVisible(false)
  }

  gemChange() {
    //console.log(global)

    let characterList = global.characters

    if (global.characters.length !== 0) {

      for (let i = 0; i < avatarList.length; i++) {
        const row = Math.floor(i % 2)
        const col = Math.floor(i / 2)
        let modelName =
          characterList.filter((character) => character.characterNo === i)
            .length > 0
            ? `model-${avatarList[i]}`
            : `model1-${avatarList[i]}`
        let level =
          characterList.filter((character) => character.characterNo === i)
            .length > 0
            ? 'LVL:' +
              Math.floor(
                characterList
                  .filter((character) => character.characterNo === i)[0]
                  .exp.valueOf() /
                  100 +
                  1,
              ).toString()
            : ''
        let rarity =
          characterList.filter((character) => character.characterNo === i)
            .length > 0
            ? characterList
                .filter((character) => character.characterNo === i)[0]
                .rarity.toString()
            : ''

        const lvtext: any = this.scene.add.text(
          row * 300 + 80,
          col * 300 - 60,
          level,
          { fontSize: '20px', fontFamily: 'Anime Ace', color: 'white' },
        ).setVisible(false)
        this.lvTexts.push(lvtext)

        if (rarity === '0') {
          rarity = 'common'
        } else if (rarity === '1') {
          rarity = 'rare'
        } else if (rarity === '2') {
          rarity = 'legendary'
        }

        // const raritytext = this.scene.add.text(row * 220+15, col * 220 - 280, rarity, {
        //   fontSize: "20px",
        //   fontFamily: "Anime Ace",

        //   color: rarity==="common"?"gray":rarity==="rare"?"violet":rarity==="legendary"?"#efda4e":""
        // });
        // raritytext.setStroke("black",5);
        // raritytext.setAngle(-45); // Adjust the angle here as per your requirement
        // raritytext.setOrigin(0.5)
        // this.add(raritytext);

        const raritytext = this.scene.add.text(
          row * 300 + 20,
          col * 305 - 240,
          rarity,
          {
            fontSize: '20px',
            fontFamily: 'Anime Ace',
            color:
              rarity === 'common'
                ? 'gray'
                : rarity === 'rare'
                ? 'violet'
                : rarity === 'legendary'
                ? '#efda4e'
                : '',
          },
        )

        raritytext.setStroke('black', 5)
        raritytext.setAngle(-45)
        raritytext.setOrigin(0.5)
        raritytext.setVisible(false)
        this.rarityTexts.push(raritytext) // Add the raritytext to the array

        // You can add more rarity texts to the array if needed

        
        
        this.model[i]
          .setPosition(row * 300 + 110, col * 300 - 160)

          .setTexture(modelName)
          .removeListener('pointerdown')
          .on('pointerdown', () => {

            
            if (
              global.characters.filter(
                (character) => character.characterNo === i,
              ).length === 0
            ) {
              alert('MUST BE PURCHASED')
            } else {
              setCurrentCharacter('siren-' + (i + 1)).then(() => {
                getProfile(global.walletAddress, 'siren-' + (i + 1)).then(
                  () => {
                    let embed = global.embed.filter(item=>item.character===global.currentCharacterName)
                    this.updateHpCritical(
                      global.hp,
                      global.critical,
                      global.damage,
                      embed,
                    )
                    //console.log(global)
                    this.openModel(i)
                    this.embedBuild()
                    for (let i = 0; i < this.rarityTexts.length; i++) {
                      this.rarityTexts[i].setVisible(false)
                      this.remove(this.rarityTexts[i])
                      
                    }
                    this.rarityTexts=[]
                    for (let i = 0; i < this.lvTexts.length; i++) {
                      this.lvTexts[i].setVisible(false)

                      this.remove(this.lvTexts[i])
                      
                    }
                    this.lvTexts=[]
                  },
                )
              })
            }
          })
        //
      }
    }
    this.add(this.rarityTexts) // Add the array of rarity texts to the scene
    this.add(this.lvTexts)
    for(let i=0; i < this.rarityTexts.length; i++){
      this.rarityTexts[i].setVisible(true)
      this.lvTexts[i].setVisible(true)
    }
  }
  gemBuild() {
    let itemList = new Phaser.Structs.List<StockItem>(null)
    let data = global.purchase
    //this.energy.setText(`${global.energy}`)
    this.energySwapEdit.setVisible(false)
    this.energySwapText.setVisible(false)
    this.energySwapText1.setVisible(false)
    this.waterText.setVisible(false)
    this.waterText1.setVisible(false)
    this.waterText2.setVisible(false)
    this.swapBtn.setVisible(false)
    let embed = global.embed.filter(item=>item.character===global.currentCharacterName)
    this.updateHpCritical(global.hp, global.critical, global.damage, embed)
    for (let j = 0; j < this.gem.length; j++) {
      this.gem.getAt(j).destroy()
      // this.gem.getAt(j).setVisible(false)
      // this.remove(this.gem.getAt(j))
    }
    this.gem = new Phaser.Structs.List<StockItem>(null)
    data = global.purchase
    for (let i = 0; i < data.length; i++) {
      let type = data[i].item
      const row = Math.floor(i / 3)
      const col = Math.floor(i % 3)
      const count = data[i].stock
      if (count > 0 && type !== 'loot') {
        type = type.replace('_', '-')
        const newItem = new StockItem(this.scene, 0, 0, type, count)
          .setInteractive()
          .on('pointerdown', () => {
            itemModify(
              global.walletAddress,
              global.currentCharacterName,
              data[i].item,
              -1,
              global.room.chapter,
              global.room.section,
              global.chapter,
              global.section,
              (resp: any) => {
                //console.log(resp)

                if (resp.purchase !== undefined) {
                  changeItem(resp)
                  let embed = global.embed.filter(item=>item.character===global.currentCharacterName)
                  //console.log(global.embed)
                  this.updateHpCritical(
                    global.hp,
                    global.critical,
                    global.damage,
                    embed,
                  )
                  this.gemBuild()
                  this.embedBuild()
                }
              },
            )
          })
        this.add(newItem)
        this.gem.add(newItem)
      }
    }
    this.arrangeGem()
  }

  embedBuild() {
    for (let j = 0; j < this.embedGem.length; j++) {
      this.embedGem.getAt(j).destroy()
      // this.embedGem.getAt(j).setVisible(false)
      // this.remove(this.embedGem.getAt(j))
    }
    //console.log(global.embed, global.currentCharacterName)
    const embed = global.embed.filter(
      (obj) => obj.character === global.currentCharacterName,
    )
    //console.log(embed)
    for (let i = 0; i < embed.length; i++) {
      let type = embed[i].item
      const count = embed[i].stock
      if (count > 0) {
        type = type.replace('_', '-')
        let newItem = this.scene.add
          .image(-289 + 59 * i, 13, `item-${type}`)
          .setDisplaySize(40, 40)
          .setInteractive()
          .on('pointerdown', () => {
            newItem.removeListener('pointerdown')
            itemRevive(
              global.walletAddress,
              global.currentCharacterName,
              embed[i].item,
              (resp: any) => {
                if (resp.purchase !== undefined) changeItem(resp)
                //console.log(global.embed)
                this.embedBuild()
                this.gemBuild()
              },
            )
          })
        this.add(newItem)
        this.embedGem.add(newItem)
      }
    }
    this.setWeaponList(false)
  }
  openModel(type: number) {
    this.sceneMode(2)
    energySwap(
      global.walletAddress,
      global.currentCharacterName,
      0,
      (resp: any) => {
        //console.log(resp)

        global.energy = resp.energy
        global.resource = resp.resource
        this.energy.setText(`${global.energy}`)
        this.waterText1.setText(`${global.resource}`)
      },
    )
  }
  arrangeGem() {
    for (let j = 0; j < this.gem.length; j++) {
      const row = Math.floor(j % 4)
      const col = Math.floor(j / 4)
      const cell = this.gem.getAt(j)
      cell.move(row * 160 + 20, col * 160 - 240)
    }
  }
  setModelList(visible: boolean) {
    this.background.setVisible(visible)
    for (let i = 0; i < avatarList.length; i++) {
      this.model[i].setVisible(visible)
    }
  }
  setWeaponList(visible: boolean) {
    // this.background.setVisible(visible)
    for (let i = 0; i < weaponList.length; i++) {
      this.weapon[i].setVisible(visible)
    }
  }
  setGemList(visible: boolean) {
    // this.background.setVisible(visible)
    for (let i = 0; i < this.gem.length; i++) {
      const item = this.gem.getAt(i)
      item.visible = visible
    }
  }
  setEmbedList(visible: boolean) {
    // this.background.setVisible(visible)
    for (let i = 0; i < this.embedGem.length; i++) {
      const item = this.embedGem.getAt(i)
      item.visible = visible
    }
  }
  showStatus(visible: boolean) {
    this.setVisible(visible)
    this.sirenSpine.setVisible(false)
    this.siren3.setVisible(false)
    if (visible) this.sceneMode(1)
  }

  sceneMode(mode: number) {
    switch (mode) {
      case 1: {
        //modelList
        this.setModelList(true)
        this.setWeaponList(false)
        this.setGemList(false)
        this.setEmbedList(false)
        this.closeBtn.setVisible(true)
        this.modelBackground.setVisible(false)
        this.background.setVisible(true)
        this.sirenSpine.setVisible(false)
        this.siren3.setVisible(false)
        this.addWeapon.setVisible(false)
        this.addGem.setVisible(false)
        this.addEnergy.setVisible(false)
        //this.inventory_frame.setVisible(false)
        this.health.setVisible(false)
        this.energy.setVisible(false)
        this.critical.setVisible(false)
        this.expLabel.setVisible(false)
        this.levelLabel.setVisible(false)
        this.energySwapText.setVisible(false)
        this.energySwapText1.setVisible(false)
        this.energySwapEdit.setVisible(false)
        this.siren3.setVisible(false)
        this.waterText.setVisible(false)
        this.waterText1.setVisible(false)
        this.waterText2.setVisible(false)
        this.swapBtn.setVisible(false)

        break
      }
      case 2: {
        //ownModel
        this.setModelList(false)
        this.setWeaponList(false)
        this.setGemList(false)
        this.setEmbedList(true)
        this.modelBackground.setVisible(true)
        this.background.setVisible(true)
        this.closeBtn.setVisible(true)
        // this.background.setVisible(false)
        this.siren3.setVisible(false)
        if (global.currentCharacterName === 'siren-1') {
          this.sirenSpine.setVisible(true)
        } else {
          createCharacterAnims(this.scene.anims)
          this.siren3.play('siren-3')
          this.siren3.setVisible(true)
        }
        this.addWeapon.setVisible(true)
        this.addGem.setVisible(true)
        this.addEnergy.setVisible(true)
        //this.inventory_frame.setVisible(true)
        this.health.setVisible(true)
        this.energy.setVisible(true)
        this.critical.setVisible(true)
        this.expLabel.setVisible(true)
        this.levelLabel.setVisible(true)

        this.energySwapText.setVisible(false)
        this.energySwapEdit.setVisible(false)
        this.energySwapText1.setVisible(false)
        this.waterText.setVisible(false)
        this.waterText1.setVisible(false)
        this.waterText2.setVisible(false)
        this.swapBtn.setVisible(false)
        break
      }
      case 3: {
        //weaponModel
        this.setWeaponList(true)
        this.setGemList(false)
        this.health.setVisible(true)
        this.energy.setVisible(true)
        this.critical.setVisible(true)
        this.background.setVisible(true)
        this.energySwapEdit.setVisible(false)
        this.energySwapText.setVisible(false)
        this.energySwapText1.setVisible(false)
        this.waterText.setVisible(false)
        this.waterText1.setVisible(false)
        this.waterText2.setVisible(false)
        this.swapBtn.setVisible(false)
        break
      }
      case 4: {
        //gemModel
        this.setGemList(true)
        this.setWeaponList(false)
        this.health.setVisible(true)
        this.critical.setVisible(true)
        this.background.setVisible(true)
        this.energySwapEdit.setVisible(false)
        this.energySwapText.setVisible(false)
        this.energySwapText1.setVisible(false)
        this.waterText.setVisible(false)
        this.waterText1.setVisible(false)
        this.waterText2.setVisible(false)
        this.swapBtn.setVisible(false)
        break
      }
      case 5: {
        //waterSwap
        this.setGemList(false)
        this.setWeaponList(false)
        this.energySwapEdit.setVisible(true)
        this.energySwapText.setVisible(true)
        this.energySwapText1.setVisible(true)
        this.waterText.setVisible(true)
        this.waterText1.setVisible(true)
        this.waterText2.setVisible(true)
        this.background.setVisible(true)
        this.swapBtn.setVisible(true)
        break
      }
    }
  }
  updateHpCritical(hp: number, critical: number, damage: number, embed: Array<any>) {
    console.log(embed)
    embed.map((item) => {
      let type = item.item
      if (type === 'infernal_1') {
        critical += 5
      } else if (type === 'infernal_2') {
        critical += 10
      } else if (type === 'infernal_3') {
        critical += 15
      } else if (type === 'chimera_1') {
        hp += 50
      } else if (type === 'chimera_2') {
        hp += 100
      } else if (type === 'chimera_3') {
        hp += 150
      } else if (type === 'gem_1') {
        damage += 10
      } else if (type === 'gem_2') {
        damage += 20
      } else if (type === 'gem_3') {
        damage += 30
      }
    })

    this.health.setText(`${hp}`)
    this.critical.setText(`${critical}%`)
    const exp = Math.floor(global.exp % 100)
    const level = Math.floor(global.exp / 100) + 1
    this.levelLabel.setText(`${level}`)
    this.expLabel.setText(`${exp}/100`)
  }
}
