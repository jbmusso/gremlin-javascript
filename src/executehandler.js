import highland from 'highland';
import _ from 'lodash';


function defaultExecuteHandler(messageStream, callback) {
  let errored = false;
  let objectMode = false;

  highland(messageStream)
    .stopOnError((err) => {
      // TODO: this does not seem to halt the stream properly, and make
      // the callback being fired twice. We need to get rid of the ugly
      // errored variable check.
      errored = true;
      callback(err);
    })
    .map(({ result: { data } }) => {
      objectMode = !_.isArray(data);

      return data;
    })
    .sequence()
    .toArray((results) => {
      if (!errored) {
        callback(null, objectMode ? results[0] : results);
      }
    });
}

export default defaultExecuteHandler;
