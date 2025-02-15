/* Private */
const _toggleVisibility = function() {
  if (typeof this.visible === 'boolean' && this.visible !== this.$el.visible) {
    this.$el[this.visible ? 'show' : 'hide'].call(this.$el, this.normalizedOptions || this.options);
  }
};
const _teleport = function() {
  if (!this._isDestroyed && (!this.$el.parentNode || this.$el.parentNode !== document.body)) {
    document.body.appendChild(this.$el);
  }
};
const _unmount = function() {
  if (this.$el.visible === true) {
    this.$el.hide().then(() => this.$el.remove());
  } else {
    this.$el.remove();
  }
};

/* Public */
// Components that can be shown or hidden
const hidable = {
  props: {
    visible: {
      type: Boolean,
      default: undefined // Avoid casting to false
    }
  },

  watch: {
    visible() {
      _toggleVisibility.call(this);
    }
  },

  mounted() {
    this.$nextTick(() => _toggleVisibility.call(this));
  },

  activated() {
    this.$nextTick(() => _toggleVisibility.call(this));
  }
};

// Components with 'options' property
const hasOptions = {
  props: {
    options: {
      type: Object,
      default() {
        return {};
      }
    }
  }
};

// Provides itself to its descendants
const selfProvider = {
  provide() {
    return {
      [this.$options.name.slice(6)]: this
    }
  }
};

// Common event for Dialogs
const dialogCancel = {
  emits: [ 'update:visible' ],

  mounted() {
    this._onDialogCancel = () => this.$emit('update:visible', false);
    this.$el.addEventListener('dialog-cancel', this._onDialogCancel);
  },

  beforeUnmount() {
    this.$el.removeEventListener('dialog-cancel', this._onDialogCancel);
  }
};

// Moves the element to a global position
const portal = {
  mounted() {
    _teleport.call(this);
  },
  updated() {
    _teleport.call(this);
  },
  activated() {
    _teleport.call(this);
  },
  deactivated() {
    _unmount.call(this);
  },
  beforeUnmount() {
    _unmount.call(this);
  }
};

const modifier = {
  props: {
    modifier: {
      type: [String, Array, Object]
    },
  },

  computed: {
    normalizedModifier() {
      const modifier = this.modifier;

      if (typeof modifier === 'string') {
       return modifier;
      }

      if (Array.isArray(modifier)) {
        return modifier.join(' ');
      }

      if (typeof modifier === 'object') {
        return Object.keys(modifier)
          .reduce((acc, key) => (acc + (modifier[key] ? ` ${key}` : '')), '')
          .trim();
      }

      return false;
    }
  }
};

export { hidable, hasOptions, selfProvider, dialogCancel, portal, modifier };
