import { createDecorator } from 'vue-class-component';
export function Debounce(options) {
  return createDecorator(function (opts, handler) {
    if (!opts.methods)
      throw new Error('This decorator must be used on a vue component method.');
    var time = typeof options === 'number' ? options : options.time;
    var originalFn = opts.methods[handler];
    var timeoutId = 0;
    var clear = function () {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = 0;
      }
    };
    opts.methods[handler] = function () {
      var _this = this;
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      clear();
      timeoutId = setTimeout(function () {
        timeoutId = 0;
        originalFn.apply(_this, args);
      }, time);
    };
  });
}
