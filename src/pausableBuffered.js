import Rx from 'rxjs';

function pausableBuffered(pauseSignalObservable) {
  return Rx.Observable.create(subscriber => {
    var source = this;

    var isEnabled = false;
    var closeBuffer = new Rx.Subject();
    var bufferIn = new Rx.Subject();

    var buffer = bufferIn.buffer(closeBuffer);
    buffer.subscribe(bufferedValues => {
      bufferedValues.forEach(val => subscriber.next(val));
    });

    pauseSignalObservable.subscribe(_isEnabled => {
      isEnabled = _isEnabled;
      if (isEnabled) {
        // flush buffer every when stream is enabled
        closeBuffer.next(0);
      }
    });

    var subscription = source.subscribe(
      value => {
        try {
          if (isEnabled) {
            subscriber.next(value);
          } else {
            bufferIn.next(value);
          }
        } catch (err) {
          subscriber.error(err);
        }
      },
      err => subscriber.error(err),
      () => subscriber.complete(),
    );
    return subscription;
  });
}

Rx.Observable.prototype.pausableBuffered = pausableBuffered;
