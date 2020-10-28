import {remote} from 'electron'
import {h, Component} from 'preact'
import classNames from 'classnames'

export default class LankeSite extends Component {
  componentDidMount() {
    this.base.addEventListener('dom-ready', () => {
      if (this.debuggerAttached) return
      console.log('lanke.dom-ready', this, this.base, this.base.getWebContents)
      //this.base.openDevTools()

      const debug = remote.webContents.fromId(this.base.getWebContentsId())
        .debugger
      debug.attach('1.1')
      this.debuggerAttached = true

      debug.on('message', async (event, method, params) => {
        if (!this.firstShotReloaded) {
          this.firstShotReloaded = true
          this.base.reload()
          return
        }

        //console.log('lanke on message:', method, event, params)
        switch (method) {
          case 'Network.webSocketFrameReceived':
            {
              //console.log('webSocketFrameReceived:', params.response.payloadData)
              const json = params.response.payloadData.replace(/^\d+/, '')
              if (json) {
                const data = JSON.parse(json)
                if (data[0] === 'gameMove') this.gameMove(data[1].qz)
              }
            }

            break
          case 'Network.dataReceived':
            //console.log('dataReceived:', event, params)
            if (params.requestId === this.roomRequestId) {
              this.roomRequestId = null

              const data = await debug.sendCommand('Network.getResponseBody', {
                requestId: params.requestId
              })
              //console.log('getResponseBody data:', data)
              const message = JSON.parse(data.body)

              this.setBoardState(message.data.room.qp)
            }

            break
          case 'Network.requestWillBeSent':
            //console.log('requestWillBeSent:', params.request.url)
            if (/\/roomInfo/.test(params.request.url)) {
              //console.log('getResponseBody:', params)
              this.roomRequestId = params.requestId
            }

            break
          //default:
          //  console.log('other:', method, params)
        }
      })
      debug.sendCommand('Network.enable')
    })
  }

  render() {
    return h('webview', {
      class: classNames({'pvp-site': true}),
      src: 'https://www.lanke.cc/'
    })
  }

  async setBoardState(moves) {
    //console.log('setBoardState:', data)

    await sabaki.newFile({suppressAskForSave: true})
    sabaki.setMode('edit')

    for (let move of moves) {
      move = JSON.parse(move)

      sabaki.clickVertex([move.x, move.y], {button: move.isBlack ? 0 : 2})
    }
  }

  gameMove(move) {
    //console.log('gameMove:', data)
    sabaki.clickVertex([move.x, move.y], {button: move.isBlack ? 0 : 2})
  }
}

/*
sabaki.newFile({suppressAskForSave: true})
sabaki.setMode('play')
sabaki.setMode('edit')
sabaki.clickVertex([4,9], {button: 2})
sabaki.clickVertex([4,9], {button: 0})
*/
