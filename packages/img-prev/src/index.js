import React, { PureComponent, createRef } from 'react';
import classnames from 'classnames';
import styles from './style.less';

const openStatus = {
  open: 'open',
  closing: 'closing',
  closed: 'closed'
};
const PREVIEW_INDEX_NAME = 'data-privew-index';
const WHEEL_MAX_VAL = 500; // 最大滚动值
const MAX_SCALE = 50;

export default class ImgsPreview extends PureComponent {
  constructor(props) {
    super(props);
    this.previewDom = createRef();
    this.state = {
      index: 0,
      previewOpen: openStatus.closed,
      mouseWheelValue: 0,
      imgRotate: 0,
    }
  }

  componentDidMount() {
    this.caputreImgs();
    this.bindImgTagClick();
  }

  componentWillUnmount() {
    const { current } = this.previewDom;
    current.removeEventListener('click', this.caputreImgsClick);
  }

  // 键盘监听
  keyboardListener = (operation) => {
    const listener = {
      add: 'addEventListener',
      remove: 'removeEventListener', 
    };
    const result = listener[operation];
    result && document[result]('keydown', this.keyboardEvent);
  }

  // 键盘事件
  keyboardEvent = (e) => {
    switch(e.keyCode) {
      case 27: // esc
        return this.previewClose();
      case 38: // 上箭头
        return this.scaleBtnClick(1)();
      case 40: // 下箭头
        return this.scaleBtnClick(-1)();
      case 37: // 左箭头
        return this.swtichPreviewingImg(-1)();
      case 39: // 右箭头
        return this.swtichPreviewingImg(1)();
      case 32: // 空格键
        return this.rotateImg();
      default:
    }
  }
      
  caputreImgs = () => {
    const { current } = this.previewDom;
    const imgs = this.imgDomsFactory(current.getElementsByTagName('img'));
    this.setState({ imgs });
  }

  caputreImgsClick = (e) => {
    const { target } = e;
    if (target.tagName.toLowerCase() === 'img') {
      const index = Number(target.getAttribute(PREVIEW_INDEX_NAME));
      this.setState({ previewOpen: openStatus.open, index });
      this.listenMouseWhell();
      this.keyboardListener('add'); // 添加键盘监听
    }
  }
  
  bindImgTagClick = () => {
    const { current } = this.previewDom;
    current.addEventListener('click', this.caputreImgsClick);
  }

  // 图片dom加工工厂方法，添加index，ignore不放大的
  imgDomsFactory = (imgDoms) => {
    let index = 0;
    const imgs = [];
    const { ignoreAttrName } = this.props;
    for (const img of imgDoms) {
      if (!img.getAttribute(ignoreAttrName)) {
        img.setAttribute(PREVIEW_INDEX_NAME, index);
        imgs.push(img);
        index += 1;
      }
    }
    return imgs;
  }

  imgScaleStyle = () => {
    const { mouseWheelValue, imgRotate } = this.state;
    const coefficient = MAX_SCALE / WHEEL_MAX_VAL;
    const result = (mouseWheelValue * coefficient) / 100;
    return {
      transform: `scale(${1 + result}) rotate(${imgRotate}deg)`,
    }
  }

  previewClose = (e) => {
    // 仅点击触发元素才执行，避免再写阻止冒泡，当没有参数时，直接关闭
    if (!e || e.target === e.currentTarget) {
      const { maskClose = true } = this.props;
      this.keyboardListener('remove'); // 删除键盘监听
      maskClose && this.setState({ previewOpen: openStatus.closing }, () => {
        setTimeout(() => this.setState({ previewOpen: openStatus.closed }), 300);
      });
    }
  }

  // 鼠标滚动监听
  listenMouseWhell = (e) => {
    if (e) {
      if (this.wheelTimer) {
        return false;
      }
      const { wheelDeltaY, deltaY } = e.nativeEvent 
      this.wheelTimer = setTimeout(() => {
        const mouseWheelValue = this.state.mouseWheelValue + (wheelDeltaY || -deltaY);
        this.refreshWheelValue(mouseWheelValue)
        this.wheelTimer = null;
      }, 300);
    }
  }

  scaleBtnClick = (scale) => {
    return () => {
      const { mouseWheelValue } = this.state;
      this.refreshWheelValue(mouseWheelValue + (WHEEL_MAX_VAL / 5) * scale);
    }
  }

  // 更新滚轮数值
  refreshWheelValue = (wheelValue) => {
    const symbolVal = wheelValue > 0 ? 1 : -1;
    Math.abs(wheelValue) > WHEEL_MAX_VAL && (wheelValue = WHEEL_MAX_VAL * symbolVal);  
    this.setState({ mouseWheelValue: wheelValue });
  }

  // 切换预览图片
  swtichPreviewingImg = (direction) => {
    return () => {
      const { index, imgs } = this.state;
      const result = index + direction;
      if (result < imgs.length && result >= 0) {
        this.setState({
          index: index + direction,
          imgRotate: 0,
          mouseWheelValue: 0,
        }); 
      }
    }
  }

  // 旋转图片
  rotateImg = () => {
    if (this.rotateTimer) {
      return false;
    }
    this.rotateTimer = setTimeout(() => {
      this.setState({ imgRotate: this.state.imgRotate + 90 })
      this.rotateTimer = null;
    }, 300);
  }

  render() {
    const { previewOpen, imgs, index } = this.state;
    const { children, className } = this.props;

    return (
      <>
        <div className={className} ref={this.previewDom}>
          { children instanceof Function ? children(this.caputreImgs) : children }
        </div>
        {
          openStatus[previewOpen] !== openStatus.closed && (
            <div
              className={classnames(styles.imgPriviewMask, styles.blackMask, { [styles.maskClosing]: previewOpen === openStatus.closing })}
              onClick={this.previewClose}
            >
              <img
                onWheel={this.listenMouseWhell}
                className={styles.targetImg}
                style={this.imgScaleStyle()}
                src={imgs[index].src}
                alt={imgs[index].src}
              />
              <div className={styles.controlBar}>
                <i
                  className="bingo bingo-minus"
                  onClick={this.scaleBtnClick(-1)}
                />
                <i
                  className="bingo bingo-add"
                  onClick={this.scaleBtnClick(1)}
                />
                <i
                  className="bingo bingo-refresh"
                  onClick={this.rotateImg}
                />
                <i
                  className="bingo bingo-left-arrow"
                  onClick={this.swtichPreviewingImg(-1)}
                />
                <i
                  className="bingo bingo-right-arrow"
                  onClick={this.swtichPreviewingImg(1)}
                />
              </div>
              <i
                className={classnames(styles.closedIcon, 'bingo bingo-closed')}
                onClick={this.previewClose}
              />
            </div>
          )
        }
      </>
    );
  }
}

ImgsPreview.propType = {
  ignoreAttrVal: ''
}
