import {h, Component} from 'preact'
import classNames from 'classnames'

export default class LankeSite extends Component {
  render() {
    return h('iframe', {
      class: classNames({'pvp-site': true})
    })
  }
}
