type Event = string;
type Fn = (payload: Events['payload']) => void;

type StreamEvent = { evt: 'stream', payload: MediaStream };

type Events = StreamEvent;

class Emitter {
  events: {[key: Event]: Fn[]}

  constructor() {
    this.events = {};
  }

  emit(event: Events) {
    const { evt, payload } = event;

    if (evt in this.events) {
      this.events[evt].forEach((fn) => fn(payload));
    }

    return this;
  }

  on(evt: Event, fn: Fn) {
    if (evt in this.events) {
      this.events[evt].push(fn);
    } else {
      this.events[evt] = [fn];
    }

    return this;
  }

  off(evt: Event, fn: Fn) {
    if (evt && typeof fn === 'function') {
      const listeners = this.events[evt];
      const index = listeners.findIndex((_fn) => _fn === fn);
      listeners.splice(index, 1);
    } else {
      this.events[evt] = [];
    }

    return this;
  }
}

export default Emitter;