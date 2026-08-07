export function buildDataLayerScript(apiBaseUrl: string): string {
  const safeApiBaseUrl = JSON.stringify(apiBaseUrl);
  return `
(function(){
  var apiBaseUrl = ${safeApiBaseUrl};
  var cache = new Map();
  var inflight = new Map();
  var controllers = new Set();
  var pending = 0;

  function emitLoading(){
    window.dispatchEvent(new CustomEvent('satset:loading', { detail: { pending: pending } }));
  }

  function emitError(error){
    window.dispatchEvent(new CustomEvent('satset:error', { detail: { error: error } }));
  }

  function toKey(method,path,body){
    return method + ':' + path + ':' + (body || '');
  }

  function delay(ms){
    return new Promise(function(resolve){ setTimeout(resolve, ms); });
  }

  async function request(path, init){
    var options = init || {};
    var method = String(options.method || 'GET').toUpperCase();
    var timeoutMs = typeof options.timeoutMs === 'number' ? options.timeoutMs : 10000;
    var retries = typeof options.retries === 'number' ? options.retries : 2;
    var retryDelayMs = typeof options.retryDelayMs === 'number' ? options.retryDelayMs : 200;
    var cacheTtlMs = typeof options.cacheTtlMs === 'number' ? options.cacheTtlMs : 15000;
    var noCache = options.noCache === true;
    var key = toKey(method, path, options.body ? String(options.body) : '');
    var useCache = method === 'GET' && !noCache;

    if(useCache){
      var cached = cache.get(key);
      if(cached && Date.now() < cached.expiresAt){
        return cached.value;
      }
      var pendingRequest = inflight.get(key);
      if(pendingRequest){
        return pendingRequest;
      }
    }

    var run = (async function(){
      var attempt = 0;
      while(attempt <= retries){
        var controller = new AbortController();
        controllers.add(controller);
        var timer = setTimeout(function(){ controller.abort('timeout'); }, timeoutMs);
        pending += 1;
        emitLoading();

        try{
          var response = await fetch(apiBaseUrl + path, {
            method: options.method,
            headers: options.headers,
            body: options.body,
            signal: controller.signal
          });

          if(!response.ok && response.status !== 204){
            var httpErr = new Error('HTTP ' + response.status);
            httpErr.code = 'HTTP_ERROR';
            httpErr.status = response.status;
            throw httpErr;
          }

          if(response.status === 204){
            return null;
          }

          var payload = await response.json();
          if(useCache){
            cache.set(key, { value: payload, expiresAt: Date.now() + cacheTtlMs });
          }
          return payload;
        }catch(error){
          var isTimeout = error && error.name === 'AbortError';
          if(isTimeout){
            error.code = 'TIMEOUT';
          }
          var shouldRetry = attempt < retries && (isTimeout || (error && error.status >= 500));
          if(!shouldRetry){
            emitError(error);
            throw error;
          }
          attempt += 1;
          await delay(retryDelayMs * attempt);
        }finally{
          clearTimeout(timer);
          controllers.delete(controller);
          pending -= 1;
          if(pending < 0){ pending = 0; }
          emitLoading();
        }
      }
      return null;
    })();

    if(useCache){
      inflight.set(key, run);
    }
    try{
      return await run;
    }finally{
      if(useCache){
        inflight.delete(key);
      }
    }
  }

  function clearCache(prefix){
    if(!prefix){
      cache.clear();
      return;
    }
    Array.from(cache.keys()).forEach(function(key){
      if(key.indexOf(prefix) === 0){
        cache.delete(key);
      }
    });
  }

  function abortAll(reason){
    controllers.forEach(function(controller){ controller.abort(reason || 'dispose'); });
    controllers.clear();
  }

  window.__satsetData = {
    request: request,
    clearCache: clearCache,
    abortAll: abortAll
  };

  window.addEventListener('beforeunload', function(){
    abortAll('beforeunload');
  });
})();`;
}
