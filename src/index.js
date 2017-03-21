
const STATES = {
  entering: 0,
  shown: 1,
  exiting: -1
};

const DEFAULT_OPTIONS = {
  transitionTime: 600,
  timeout: 4000,
  template: `<div class="pure-notify {type}"><i class="pure-icon {type}"></i><div class="title">{title}</div><div class="content">{content}</div><i class="pure-icon close"></i></div>`,
  className: ''
};

function _render(template, context) {
  return template.replace(/\{\s*([\w\d_$]+)\s*\}/g, (m, n) => {
    return context.hasOwnProperty(n) ? context[n] : m;
  });
}

function _css($dom, css) {
  for(let k in css) {
    $dom.style[k] = css[k];
  }
}

function _opt(options, type) {
  if (typeof options === 'string') {
    options = { title: options };
  }
  if (!options.type) {
    options.type = type || 'info';
  }
  return options;
}


class NotifyItem {
  constructor(manager, options = {}, top) {
    this._manager = manager;
    this._$dom = document.createElement('div');
    this._height = 0;
    this._width = 0;
    _css(this._$dom, {
      position: 'fixed',
      top: `${top}px`,
      right: '-10000px',
      opacity: 0,
    });
    document.body.appendChild(this._$dom);
    this._render(options);

    let _$close = this._$dom.querySelector('.close');
    if (_$close) {
      _$close.addEventListener('click', () => {
        this._manager.close(this);
      });
    }
    this._state = STATES.entering;
    this._timeoutTM = null;

    _css(this._$dom, {
      right: `-${this._width}px`,
      transition: `top ${DEFAULT_OPTIONS.transitionTime}ms ease, right ${DEFAULT_OPTIONS.transitionTime}ms ease, opacity ${DEFAULT_OPTIONS.transitionTime}ms ease`
    });
    setTimeout(() => {
      _css(this._$dom, {
        right: 0,
        opacity: 1
      });
      setTimeout(() => {
        if (this._state === STATES.exiting) return; // already exits
        this._state = STATES.shown;
        this._setTimeout(options);
      }, DEFAULT_OPTIONS.transitionTime);
    });
  }
  setDefaultOptions(options = {}) {
    if (typeof options !== 'object' || !options) {
      throw new Error('Bad options!');
    }
    for(let pn in options) {
      if (DEFAULT_OPTIONS.hasOwnProperty(pn)) {
        DEFAULT_OPTIONS[pn] = options[pn];
      }
    }
  }
  _setTimeout(options) {
    if (this._timeoutTM) {
      clearTimeout(this._timeoutTM);
      this._timeoutTM = null;
    }
    let timeout = options.timeout;
    if (typeof timeout === 'undefined') {
      timeout = DEFAULT_OPTIONS.timemout;
    }
    if (timeout > 0) {
      this._timeoutTM = setTimeout(() => {
        if (this._state === STATES.exiting) return; // already exits
        this._manager.close(this);
      }, timeout);
    }
  }
  _render(options) {
    let template = options.template || DEFAULT_OPTIONS.template;
    let context = {
      content: options.content || '',
      title: options.title || '',
      type: options.type || 'info'
    };
    this._$dom.className = 'pure-notify-container' + (options.className ? ` ${options.className}` : '');
    this._$dom.innerHTML = _render(template, context);
    this._width = this._$dom.offsetWidth;
    this._height = this._$dom.offsetHeight;
  }
  update(options) {
    if (this._state === STATES.exiting || !this._manager) return;
    this._manager.update(this, options);
  }
  close() {
    this._manager && this._manager.close(this);
  }
}

class NotifyManager {
  constructor() {
    this._notifies = [];
    this._totalHeight = 0;
  }
  get NOTIFY_STATES() {
    return STATES;
  }
  close(item) {
    let idx = this._notifies.indexOf(item);
    if (idx < 0) return;
    if (item._state === STATES.exiting) return;
    setTimeout(() => {
      item._state = STATES.exiting;
      _css(item._$dom, {
        right: `-${item._width}px`,
        opacity: 0
      });
      setTimeout(() => {
        let idx = this._notifies.indexOf(item);
        if (idx >= 0) {
          this._notifies.splice(idx, 1);
          document.body.removeChild(item._$dom);
          item._manager = null;
          item._$dom = null;
          this._totalHeight -= item._height;
          this._layout();
        }
      }, DEFAULT_OPTIONS.transitionTime);
    });
  }
  _layout() {
    this._notifies.reduce((top, not) => {
      _css(not._$dom, {
        top: `${top}px`
      });
      return top + not._height;
    }, 0);
  }
  update(item, options) {
    let idx = this._notifies.indexOf(item);
    if (idx < 0) return;
    if (item._state === STATES.exiting || !item._manager) return;
    let opts = _opt(options);
    let ph = item._height;
    item._render(opts);
    this._totalHeight = this._totalHeight - ph + item._height;
    item._settimeout(opts);
  }
  show(options = {}) {

    let item = new NotifyItem(
      this, _opt(options),
      this._totalHeight
    );
    this._notifies.push(item);
    this._totalHeight += item._height;

    return item;
  }
  success(options) {
    return this.show(_opt(options, 'success'));
  }
  error(options) {
    return this.show(_opt(options, 'error'));
  }
  warn(options) {
    return this.show(_opt(options, 'warn'));
  }
  info(options) {
    return this.show(_opt(options, 'info'));
  }
}

export default new NotifyManager();
