export default {
  /**
   * 节流原理：在一定时间内，只能触发一次
   * @param {Function} func 要执行的回调函数
   * @param {Number} wait 延时的时间
   * @param {Boolean} immediate 是否立即执行
   * @return null
   */
  throttle(func, wait = 500, immediate = true) {
    if (immediate) {
      if (!this.flag) {
        this.flag = true;
        // 如果是立即执行，则在wait毫秒内开始时执行
        typeof func === 'function' && func();
        this.timer = setTimeout(() => {
          this.flag = false;
        }, wait);
      }
    } else {
      if (!this.flag) {
        this.flag = true
        // 如果是非立即执行，则在wait毫秒内的结束处执行
        this.timer = setTimeout(() => {
          this.flag = false
          typeof func === 'function' && func();
        }, wait);
      }

    }
  },

  /**
   * 防抖原理：一定时间内，只有最后一次操作，再过wait毫秒后才执行函数
   * @param {Function} func 要执行的回调函数
   * @param {Number} wait 延时的时间
   * @param {Boolean} immediate 是否立即执行
   * @return null
   */
  debounce(func, wait = 500, immediate = false) {
    // 清除定时器
    if (this.timeout !== null) clearTimeout(this.timeout);
    // 立即执行，此类情况一般用不到
    if (immediate) {
      var callNow = !this.timeout;
      this.timeout = setTimeout(function () {
        this.timeout = null;
      }, wait);
      if (callNow) typeof func === 'function' && func();
    } else {
      // 设置定时器，当最后一次操作后，timeout不会再被清除，所以在延时wait毫秒后执行func回调方法
      this.timeout = setTimeout(function () {
        typeof func === 'function' && func();
      }, wait);
    }
  },

  /**
   * 获取平台名称
   * @return {string} 平台名称
   */
  getPlatform() {
    let platform;
    switch (process.env.VUE_APP_PLATFORM) {
      case 'app':
      case 'app-plus':
        let n = uni.getSystemInfoSync().platform.toLowerCase();
        if (n === 'ios') {
          platform = 'ios';
        } else if (n === 'android') {
          platform = 'android';
        } else {
          platform = 'app';
        }
        break;
      case 'mp-weixin':
        platform = 'wx';
        break;
      case 'mp-alipay':
        platform = 'alipay';
        break;
      case 'mp-baidu':
        platform = 'baidu';
        break;
      case 'mp-qq':
        platform = 'qq';
        break;
      case 'mp-toutiao':
        platform = 'toutiao';
        break;
      case 'quickapp-webview':
        platform = 'kuai';
        break;
    }

    return platform;
  },

  /**
   * 数组去重
   * @param {Array} array 数值
   * @retrun {Array} 数值
   */
  arrayShuffle(array) {
    let i = array.length, t, j;
    while (i) {
      j = Math.floor(Math.random() * i--);
      t = array[i];
      array[i] = array[j];
      array[j] = t;
    }
    return array;
  },

  /**
   * 随机字符
   * @param {number} n 数量
   * @retrun {string} 随机字符
   */
  randomString(n = 6) {
    let result = '';
    const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    for (let i = 0; i < n; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * 同步等待
   * @param {number} timeout 等待时间（毫秒）
   * @retrun {Promise}
   */
  sleep(timeout= 1000) {
    return new Promise(resolve => {
      let timer = setTimeout(() => {
        timer = null;
        return resolve();
      }, timeout)
    });
  },

  /**
   * 数组去重
   * @param {Array} array 数组
   * @retrun {Array} 去重后的数组
   */
  unique(array) {
    return [...new Set(array)];
  },

  /**
   * 播放声音
   * @param {string} src 声音文件地址
   * @param {Boolean} loop 是否循环
   */
  playSound(src, loop = false) {
    const innerAudioContext = uni.createInnerAudioContext();
    innerAudioContext.autoplay = true;
    innerAudioContext.loop = loop;
    innerAudioContext.src = src;
    innerAudioContext.onPlay(() => {});
    innerAudioContext.onError((res) => {});
  },

  /**
   * 下载图片
   * @param {string} url 图片地址
   * @param {Function} cb 回调函数
   */
  download(url, cb) {
    // if (url.search('http://') !== -1) {
    //  url = url.replace('http://', 'https://')
    // }

    uni.showLoading({
      title: '正在保存图片...'
    });

    const saveImg = () => {
      uni.getImageInfo({
        src: url,
        success(image) {
          uni.saveImageToPhotosAlbum({
            filePath: image.path,
            success(e) {
              cb && cb();
              return uni.showToast({
                title: "保存成功！",
              });
            }
          });
        }
      });
    }

    let album = 'scope.writePhotosAlbum';
    // #ifdef MP-TOUTIAO
    album = 'scope.album';
    // #endif

    uni.getSetting({
      success: res => {
        // 如果没有相册权限
        if (res.authSetting[album]) {
          saveImg();
        } else {
          //向用户发起授权请求
          uni.authorize({
            scope: album,
            success: () => {
              // 授权成功保存图片到系统相册
              saveImg();
            },
            //授权失败
            fail: () => {
              uni.showModal({
                title: "您已拒绝获取相册权限",
                content: "是否进入权限管理，调整授权？",
                success: res => {
                  if (res.confirm) {
                    // 调起客户端小程序设置界面，返回用户设置的操作结果。（重新让用户授权）
                    uni.openSetting();
                  } else if (res.cancel) {
                    return uni.showToast({
                      title: "已取消！",
                    });
                  }
                },
              });
            },
          });
        }
      },
      complete() {
        uni.hideLoading();
      }
    });
  },

  // 返回上一页
  /**
   * 返回上一页
   * @param {Function} cb 回调地址
   */
  back(cb) {
    uni.navigateBack({
      delta: 1,
      success(){
        if (cb) {
          cb();
        }
      },
      fail() {
        uni.redirectTo({
          url:'/pages/index/index',
          fail() {
            uni.switchTab({
              url:'/pages/index/index'
            })
          }
        })
      }
    })
  },

  /**
   * 图片转base64
   * @param {string} src 图片地址
   * @return {Promise} base64
   */
  imageToBase64(src) {
    return new Promise((resolve, reject) => {
      uni.getImageInfo({
        src,
        success: image => {
          console.log(image);
          uni.getFileSystemManager().readFile({
            filePath: image.path,
            encoding: 'base64',
            success: e => {
              return resolve(`data:image/jpeg;base64,${e.data}`);
            },
            fail: e => {
              return reject(null);
            }
          })
        }
      });
    })
  },

  /**
   * 随机范围内的数字
   * @param {number} start 起始数字
   * @param {number} end 起始数字
   * @return {number || null} 随机数
   */
  randomByRange(start, end){
    if (typeof start === 'number' && typeof end === 'number') {
      return start + Math.floor(Math.random() * (end - start));
    } else {
      console.error('参数必须为数字');
      return null;
    }
  },

  /**
   * toast提示
   * @param {string} title 提示文字
   * @param {string} icon icon
   * @param {number} duration 延时
   * @param {function} callBack 回调
   */
  showToast(title, icon = 'none', duration = 1500, callBack = () => {}) {
    uni.showToast({
      icon,
      title,
      duration,
    });
    setTimeout(() => {
      callBack();
    }, duration);
  },
  showLoading(title, mask = true) {
    uni.showLoading({
      title,
      mask
    })
  },
  isObject(obj) {
    return typeof obj === 'object' && obj !== null;
  },
  isEmptyObj(obj) {
    return Object.keys(obj).length === 0;
  }
}
