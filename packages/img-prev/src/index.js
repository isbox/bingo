import React, { PureComponent, createRef } from 'react';
import classnames from 'classnames';
import styles from './style.less';

const openStatus = {
  open: 'open',
  closing: 'closing',
  closed: 'closed'
};
const PREVIEW_INDEX_NAME = 'data-privew-index';

export default class ImgsPreview extends PureComponent {
  constructor(props) {
    super(props);
    this.previewDom = createRef();
    this.state = {
      index: 0,
      previewOpen: openStatus.closed
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

  caputreImgs = () => {
    const { current } = this.previewDom;
    const imgs = this.imgDomsFactory(current.getElementsByTagName('img'));
    this.setState({ imgs });
  }

  caputreImgsClick = (e) => {
    const { target } = e;
    if (target.tagName.toLowerCase() === 'img') {
      const index = target.getAttribute(PREVIEW_INDEX_NAME);
      this.setState({ previewOpen: openStatus.open, index });
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
            <div className={classnames(styles.imgPriviewMask, styles.blackMask)}>
              <img className={styles.targetImg} src={imgs[index].src} alt="预览"/>
              <div className="">
                s
              </div>
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
