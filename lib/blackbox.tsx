// blackbox.tsx
"use client";
import React, {
    ReactNode,
    ComponentType,
    createContext,
    useContext,
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo,
    Component,
  } from 'react';
  
  // ============================================================================
  //
  //  1. DATA MODELS
  //
  // ============================================================================
  
  /** A unique ID for each log entry (e.g., nanoid) */
  export type LogId = string;
  
  /** Discriminant for the log type */
  export type BlackBoxEventType =
    | 'error' // window.onerror
    | 'unhandled-rejection'
    | 'react-error' // From Error Boundary
    | 'trace'
    | 'network'
    | 'console';
  
  /** Base structure shared by all log entries */
  export interface BaseEvent {
    id: LogId;
    /** Epoch milliseconds */
    ts: number;
    type: BlackBoxEventType;
  }
  
  /** A log entry for any captured error */
  export interface ErrorLog extends BaseEvent {
    type: 'error' | 'unhandled-rejection' | 'react-error';
    message: string;
    name?: string;
    stack?: string;
    componentStack?: string;
    breadcrumbs?: string[];
    meta?: Record<string, unknown>;
  }
  
  /** A log entry for a traced function call */
  export interface TraceLog extends BaseEvent {
    type: 'trace';
    functionName: string;
    kind?: 'function' | 'component' | 'effect' | 'callback';
    params: unknown;
    returnValue?: unknown;
    error?: { message: string; name?: string; stack?: string };
    executionTimeMs: number;
    tags?: string[];
  }
  
  /** A log entry for a network request */
  export interface NetworkLog extends BaseEvent {
    type: 'network';
    method: string;
    url: string;
    status?: number;
    ok?: boolean;
    durationMs?: number;
    requestHeaders?: Record<string, string>;
    requestBodyPreview?: string; // Truncated
    responseHeaders?: Record<string, string>;
    responseBodyPreview?: string; // Truncated
    error?: { message: string; stack?: string };
  }
  
  /** A log entry from a patched console method */
  export interface ConsoleLog extends BaseEvent {
    type: 'console';
    level: 'log' | 'warn' | 'error' | 'info' | 'debug';
    args: unknown[];
  }
  
  /** A union type representing any possible log entry */
  export type BlackBoxEvent = ErrorLog | TraceLog | NetworkLog | ConsoleLog;
  
  // ============================================================================
  //
  //  2. COMPONENT API: <BlackBoxProvider />
  //
  // ============================================================================
  
  export type PersistMode = 'memory' | 'sessionStorage' | 'localStorage';
  
  export interface BlackBoxProviderProps {
    children: React.ReactNode;
    isDebug?: boolean;
    debugFlagKey?: string;
    bufferSize?: number;
    persistMode?: PersistMode;
    captureNetwork?: boolean;
    captureErrors?: boolean;
    captureUnhandledRejections?: boolean;
    captureConsole?: Array<'log' | 'warn' | 'error' | 'info' | 'debug'>;
    onSave?: (batch: BlackBoxEvent[]) => Promise<void> | void;
    saveIntervalMs?: number;
    saveBatchSize?: number;
    serializer?: (value: unknown) => unknown;
    redact?: (keyPath: string[], value: unknown) => unknown;
    errorFallback?: ComponentType<{ error: Error | null }>;
  }
  
  // ============================================================================
  //
  //  3. TRACE API
  //
  // ============================================================================
  
  export interface TraceOptions {
    name?: string;
    kind?: 'function' | 'component' | 'effect' | 'callback';
    tags?: string[];
  }
  
  export type TraceFunction = <F extends (...args: any[]) => any>(
    nameOrOptions: string | TraceOptions,
    fn: F
  ) => F;
  
  // ============================================================================
  //
  //  4. HOOK API: useBlackBox()
  //
  // ============================================================================
  
  /** Filters for the log view */
  export interface BlackBoxFilters {
    types?: BlackBoxEventType[];
    query?: string;
    level?: 'log' | 'warn' | 'error' | 'info' | 'debug';
    sinceTs?: number;
    untilTs?: number;
  }
  
  export interface UseBlackBoxReturn {
    isDebug: boolean;
    logs: BlackBoxEvent[];
    trace: TraceFunction;
    clear: () => void;
    export: () => BlackBoxEvent[];
    saveNow: () => Promise<void>;
    setIsDebug: (value: boolean) => void;
    filters: BlackBoxFilters;
    setFilters: (f: Partial<BlackBoxFilters>) => void;
  }
  
  // ============================================================================
  //
  //  5. UI API: <BlackBoxUI />
  //
  // ============================================================================
  
  export interface BlackBoxUIProps {
    floating?: boolean;
    initialOpen?: boolean;
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    height?: number | string;
    width?: number | string;
  }
  
  // ============================================================================
  //
  //  INTERNAL UTILITIES
  //
  // ============================================================================
  
  /**
   * A simple ID generator.
   */
  const simpleId = (): LogId => {
    return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
  };
  
  /**
   * Default serializer with circular reference handling and depth limit.
   */
  const defaultSerializer = (value: unknown, depth = 5): unknown => {
    const cache = new Set();
    const serialize = (val: any, currentDepth: number): any => {
      if (currentDepth > depth) {
        return '[Depth Limit Exceeded]';
      }
      if (val === null || typeof val !== 'object') {
        return val;
      }
      if (val instanceof Error) {
        return {
          message: val.message,
          name: val.name,
          stack: val.stack,
        };
      }
      if (cache.has(val)) {
        return '[Circular Reference]';
      }
      cache.add(val);
  
      if (Array.isArray(val)) {
        return val.map((item) => serialize(item, currentDepth + 1));
      }
  
      const obj: any = {};
      for (const key in val) {
        if (Object.prototype.hasOwnProperty.call(val, key)) {
          obj[key] = serialize((val as any)[key], currentDepth + 1);
        }
      }
      cache.delete(val);
      return obj;
    };
    return serialize(value, 0);
  };
  
  /**
   * Default redaction function.
   */
  const defaultRedact = (keyPath: string[], value: unknown): unknown => {
    const key = keyPath[keyPath.length - 1]?.toLowerCase();
    const sensitiveKeys = ['token', 'password', 'secret', 'auth', 'key', 'cookie'];
    if (key && sensitiveKeys.some((s) => key.includes(s))) {
      return '[REDACTED]';
    }
    return value;
  };
  
  /**
   * Walk an object tree and apply redaction function.
   */
  const applyRedaction = (
    obj: any,
    redactFn: (keyPath: string[], value: unknown) => unknown,
    keyPath: string[] = []
  ): any => {
    if (obj === null || typeof obj !== 'object') {
      return redactFn(keyPath, obj);
    }
  
    if (Array.isArray(obj)) {
      return obj.map((item, idx) => 
        applyRedaction(item, redactFn, [...keyPath, String(idx)])
      );
    }
  
    const result: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = applyRedaction(obj[key], redactFn, [...keyPath, key]);
      }
    }
    return result;
  };
  
  // ============================================================================
  //
  //  INTERNAL HOOKS
  //
  // ============================================================================
  
  /**
   * Manages the in-memory circular buffer (ring buffer).
   */
  const useRingBuffer = <T,>(capacity: number) => {
    const [buffer, setBuffer] = useState<T[]>([]);
    const head = useRef(0);
    const isFull = useRef(false);
  
    const push = useCallback((item: T) => {
      setBuffer((prev) => {
        const newBuffer = [...prev];
        newBuffer[head.current] = item;
        head.current = (head.current + 1) % capacity;
        if (head.current === 0 && !isFull.current) {
          isFull.current = true;
        }
        return newBuffer;
      });
    }, [capacity]);
  
    const clear = useCallback(() => {
      setBuffer([]);
      head.current = 0;
      isFull.current = false;
    }, []);
  
    const get = useCallback((): T[] => {
      if (!isFull.current) {
        return buffer.slice(0, head.current);
      }
      // Re-order the buffer to be chronological
      return [...buffer.slice(head.current), ...buffer.slice(0, head.current)];
    }, [buffer]);
  
    return { push, clear, get, logs: get() };
  };
  
  /**
   * Manages persistence to localStorage/sessionStorage and the onSave callback.
   */
  const usePersistence = (
    logs: BlackBoxEvent[],
    onSave: BlackBoxProviderProps['onSave'],
    persistMode: PersistMode,
    saveIntervalMs: number,
    saveBatchSize: number,
    isDebug: boolean,
  ) => {
    const saveTimeout = useRef<any>(null);
    const lastSaveCount = useRef(0);
  
    const forceSave = useCallback(async () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
        saveTimeout.current = null;
      }
  
      const logsToSave = logs.slice(lastSaveCount.current);
      if (logsToSave.length > 0 && onSave) {
        try {
          await onSave(logsToSave);
          lastSaveCount.current = logs.length;
        } catch (e) {
          console.error('BlackBox onSave failed:', e);
        }
      }
    }, [logs, onSave]);
  
    useEffect(() => {
      if (!isDebug) return;

      // Handle session/local storage persistence
      if (persistMode === 'sessionStorage' || persistMode === 'localStorage') {
        const storage = persistMode === 'sessionStorage' ? sessionStorage : localStorage;
        try {
          storage.setItem('blackbox:logs', JSON.stringify(logs));
        } catch (e) {
          console.warn('BlackBox failed to save to storage:', e);
        }
      }

      // Handle onSave batching
      if (onSave) {
        const newLogCount = logs.length - lastSaveCount.current;
        if (newLogCount >= saveBatchSize) {
          forceSave();
        } else if (newLogCount > 0 && !saveTimeout.current) {
          saveTimeout.current = setTimeout(forceSave, saveIntervalMs);
        }
      }

      // Cleanup timeout on unmount
      return () => {
        if (saveTimeout.current) {
          clearTimeout(saveTimeout.current);
          saveTimeout.current = null;
        }
      };
    }, [logs, onSave, persistMode, saveBatchSize, saveIntervalMs, forceSave, isDebug]);
  
    return { saveNow: forceSave };
  };
  
  /**
   * Attaches all global event listeners and monkey-patches.
   */
  const useGlobalListeners = (
    addLog: (event: Omit<BlackBoxEvent, 'id' | 'ts'>) => void,
    props: BlackBoxProviderProps,
    isDebug: boolean,
  ) => {
    const {
      captureErrors = true,
      captureUnhandledRejections = true,
      captureNetwork = true,
      captureConsole = [],
    } = props;
  
    // 1. window.onerror
    useEffect(() => {
      if (!isDebug || !captureErrors) return;
  
      const handleError = (event: ErrorEvent) => {
        addLog({
          type: 'error',
          message: event.message,
          name: event.error?.name,
          stack: event.error?.stack,
          meta: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          },
        } as Omit<ErrorLog, 'id' | 'ts'>);
      };
      window.addEventListener('error', handleError);
      return () => window.removeEventListener('error', handleError);
    }, [addLog, captureErrors, isDebug]);
  
    // 2. window.onunhandledrejection
    useEffect(() => {
      if (!isDebug || !captureUnhandledRejections) return;
  
      const handleRejection = (event: PromiseRejectionEvent) => {
        const reason = event.reason;
        addLog({
          type: 'unhandled-rejection',
          message: reason?.message || String(reason),
          name: reason?.name,
          stack: reason?.stack,
        } as Omit<ErrorLog, 'id' | 'ts'>);
      };
      window.addEventListener('unhandledrejection', handleRejection);
      return () => window.removeEventListener('unhandledrejection', handleRejection);
    }, [addLog, captureUnhandledRejections, isDebug]);
  
    // 3 & 4. Monkey-patch Fetch and XMLHttpRequest
    useEffect(() => {
      if (!isDebug || !captureNetwork) return;
  
      const originalFetch = window.fetch;
      window.fetch = async (input, init) => {
        const startTime = performance.now();
        const method = init?.method || 'GET';
        const url = input instanceof Request ? input.url : String(input);
  
        try {
          const response = await originalFetch(input, init);
          const durationMs = performance.now() - startTime;
          addLog({
            type: 'network',
            method,
            url,
            status: response.status,
            ok: response.ok,
            durationMs,
          } as Omit<NetworkLog, 'id' | 'ts'>);
          return response;
        } catch (error: any) {
          const durationMs = performance.now() - startTime;
          addLog({
            type: 'network',
            method,
            url,
            status: 0,
            ok: false,
            durationMs,
            error: {
              message: error.message,
              stack: error.stack,
            },
          } as Omit<NetworkLog, 'id' | 'ts'>);
          throw error;
        }
      };
  
      const originalXHROpen = XMLHttpRequest.prototype.open;
      const originalXHRSend = XMLHttpRequest.prototype.send;
  
      XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...rest: any[]) {
        (this as any)._blackbox_method = method;
        (this as any)._blackbox_url = String(url);
        (this as any)._blackbox_startTime = performance.now();
        return originalXHROpen.apply(this, [method, url, ...rest] as any);
      };
  
      XMLHttpRequest.prototype.send = function(...args: any[]) {
        const xhr = this;
        const method = (xhr as any)._blackbox_method || 'GET';
        const url = (xhr as any)._blackbox_url || '';
        const startTime = (xhr as any)._blackbox_startTime || performance.now();
  
        const onLoad = () => {
          const durationMs = performance.now() - startTime;
          addLog({
            type: 'network',
            method,
            url,
            status: xhr.status,
            ok: xhr.status >= 200 && xhr.status < 300,
            durationMs,
          } as Omit<NetworkLog, 'id' | 'ts'>);
        };
  
        const onError = () => {
          const durationMs = performance.now() - startTime;
          addLog({
            type: 'network',
            method,
            url,
            status: 0,
            ok: false,
            durationMs,
            error: {
              message: 'Network request failed',
            },
          } as Omit<NetworkLog, 'id' | 'ts'>);
        };
  
        xhr.addEventListener('load', onLoad);
        xhr.addEventListener('error', onError);
  
        return originalXHRSend.apply(this, args as any);
      };
  
      return () => {
        window.fetch = originalFetch;
        XMLHttpRequest.prototype.open = originalXHROpen;
        XMLHttpRequest.prototype.send = originalXHRSend;
      };
    }, [addLog, captureNetwork, isDebug]);
  
    // 5. Monkey-patch Console
    useEffect(() => {
      if (!isDebug || captureConsole.length === 0) return;
  
      const originalConsole: { [key: string]: any } = {};
      const consoleLevels = captureConsole as Array<keyof typeof console>;
  
      consoleLevels.forEach((level) => {
        if (typeof console[level] === 'function') {
          originalConsole[level] = console[level];
          (console as any)[level] = (...args: any[]) => {
            addLog({
              type: 'console',
              level: level as 'log' | 'warn' | 'error' | 'info' | 'debug',
              args,
            } as Omit<ConsoleLog, 'id' | 'ts'>);
            originalConsole[level].apply(console, args);
          };
        }
      });
  
      return () => {
        // Restore original console methods
        Object.entries(originalConsole).forEach(([level, fn]) => {
          (console as any)[level] = fn;
        });
      };
    }, [addLog, captureConsole, isDebug]);
  };
  
  // ============================================================================
  //
  //  CONTEXT
  //
  // ============================================================================
  
  const BlackBoxContext = createContext<UseBlackBoxReturn | null>(null);
  
  /**
   * Public hook to access the BlackBox API.
   */
  export const useBlackBox = (): UseBlackBoxReturn => {
    const context = useContext(BlackBoxContext);
    if (!context) {
      throw new Error('useBlackBox must be used within a BlackBoxProvider');
    }
    return context;
  };
  
  // ============================================================================
  //
  //  ERROR BOUNDARY
  //
  // ============================================================================
  
interface ErrorBoundaryProps {
  children: ReactNode;
  onLogError: (event: Omit<BlackBoxEvent, 'id' | 'ts'>) => void;
  FallbackComponent?: ComponentType<{ error: Error | null }>;
}
  
  interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
  }
  
  class BlackBoxErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
      super(props);
      this.state = { hasError: false, error: null };
    }
  
    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
      return { hasError: true, error };
    }
  
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      this.props.onLogError({
        type: 'react-error',
        message: error.message,
        name: error.name,
        stack: error.stack,
        componentStack: errorInfo.componentStack || undefined,
      } as Omit<ErrorLog, 'id' | 'ts'>);
    }
  
    render() {
      if (this.state.hasError) {
        if (this.props.FallbackComponent) {
          return <this.props.FallbackComponent error={this.state.error} />;
        }
        // Default fallback
        return (
          <div style={{ padding: 20, backgroundColor: '#222', color: 'white' }}>
            <h2>Application Error</h2>
            <p>Something went wrong. See the BlackBox console for details.</p>
            <pre style={{ color: 'red', whiteSpace: 'pre-wrap' }}>
              {this.state.error?.message}
            </pre>
          </div>
        );
      }
      return this.props.children;
    }
  }
  
  // ============================================================================
  //
  //  PROVIDER COMPONENT
  //
  // ============================================================================
  
  export const BlackBoxProvider: React.FC<BlackBoxProviderProps> = (props) => {
    const {
      children,
      debugFlagKey = 'blackbox:debug',
      bufferSize = 5000,
      persistMode = 'memory',
      saveIntervalMs = 2000,
      saveBatchSize = 200,
      serializer = defaultSerializer,
      redact = defaultRedact,
      errorFallback: ErrorFallbackComponent,
    } = props;
  
    const [isDebug, _setIsDebug] = useState(() => {
      if (props.isDebug !== undefined) return props.isDebug;
      if (typeof window !== 'undefined') {
        return window.localStorage.getItem(debugFlagKey) === 'true';
      }
      return false;
    });
  
    const [filters, setFilters] = useState<BlackBoxFilters>({});
    const { logs, push, clear, get } = useRingBuffer<BlackBoxEvent>(bufferSize);
  
    // Sync isDebug with localStorage
    const setIsDebug = useCallback((value: boolean) => {
      _setIsDebug(value);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(debugFlagKey, String(value));
      }
    }, [debugFlagKey]);
  
    // Main addLog function
    const addLog = useCallback((eventData: Omit<BlackBoxEvent, 'id' | 'ts'>) => {
      // Apply serialization
      const serializedEvent = serializer(eventData);
  
      // Apply redaction
      const redactedEvent = applyRedaction(serializedEvent, redact);
  
      const fullEvent: BlackBoxEvent = {
        ...redactedEvent,
        id: simpleId(),
        ts: Date.now(),
      } as BlackBoxEvent;
  
      push(fullEvent);
    }, [push, serializer, redact]);
  
    // Attach global listeners
    useGlobalListeners(addLog, props, isDebug);
  
    // Manage persistence
    const { saveNow } = usePersistence(
      logs,
      props.onSave,
      persistMode,
      saveIntervalMs,
      saveBatchSize,
      isDebug,
    );
  
    // Define the Trace function
    const trace: TraceFunction = useCallback(<F extends (...args: any[]) => any>(
      nameOrOptions: string | TraceOptions,
      fn: F,
    ): F => {
      if (!isDebug) {
        return fn;
      }
  
      const options = typeof nameOrOptions === 'string'
        ? { name: nameOrOptions }
        : nameOrOptions;
      const functionName = options.name || fn.name || 'anonymous';
  
      const wrappedFn = function (this: any, ...args: Parameters<F>): ReturnType<F> {
        const startTime = performance.now();
        const params = serializer(args);
  
        try {
          const result = fn.apply(this, args);
  
          // Handle async functions
          if (result instanceof Promise) {
            return result
              .then((value) => {
                addLog({
                  type: 'trace',
                  functionName,
                  kind: options.kind,
                  tags: options.tags,
                  params,
                  returnValue: serializer(value),
                  executionTimeMs: performance.now() - startTime,
                } as Omit<TraceLog, 'id' | 'ts'>);
                return value;
              })
              .catch((error) => {
                addLog({
                  type: 'trace',
                  functionName,
                  kind: options.kind,
                  tags: options.tags,
                  params,
                  error: serializer(error) as any,
                  executionTimeMs: performance.now() - startTime,
                } as Omit<TraceLog, 'id' | 'ts'>);
                throw error;
              }) as ReturnType<F>;
          }
  
          // Handle sync functions
          addLog({
            type: 'trace',
            functionName,
            kind: options.kind,
            tags: options.tags,
            params,
            returnValue: serializer(result),
            executionTimeMs: performance.now() - startTime,
          } as Omit<TraceLog, 'id' | 'ts'>);
          return result;
  
        } catch (error) {
          addLog({
            type: 'trace',
            functionName,
            kind: options.kind,
            tags: options.tags,
            params,
            error: serializer(error) as any,
            executionTimeMs: performance.now() - startTime,
          } as Omit<TraceLog, 'id' | 'ts'>);
          throw error;
        }
      };
  
      return wrappedFn as F;
    }, [isDebug, addLog, serializer]);
  
    // Memoize the context value
    const contextValue = useMemo<UseBlackBoxReturn>(() => ({
      isDebug,
      logs,
      trace,
      clear,
      export: get,
      saveNow,
      setIsDebug,
      filters,
      setFilters,
    }), [isDebug, logs, trace, clear, get, saveNow, setIsDebug, filters]);
  
    return (
      <BlackBoxContext.Provider value={contextValue}>
        <BlackBoxErrorBoundary
          onLogError={addLog}
          FallbackComponent={ErrorFallbackComponent}
        >
          {children}
        </BlackBoxErrorBoundary>
      </BlackBoxContext.Provider>
    );
  };
  
  // ============================================================================
  //
  //  UI COMPONENT
  //
  // ============================================================================
  
  /**
   * Helper to get a short preview for a log item.
   */
  const logMessagePreview = (log: BlackBoxEvent): string => {
    switch (log.type) {
      case 'error':
      case 'react-error':
      case 'unhandled-rejection':
        return log.message;
      case 'trace':
        return log.functionName;
      case 'network':
        return `${log.method} ${log.url} - ${log.status}`;
      case 'console':
        return (log.args[0] as any)?.toString() || 'console log';
    }
    return 'Unknown log';
  };
  
  /**
   * Renders the floating UI toggle and the main debug panel.
   */
  export const BlackBoxUI: React.FC<BlackBoxUIProps> = ({
    floating = true,
    initialOpen = false,
    position = 'bottom-right',
    height = '80vh',
    width = '80vw',
  }) => {
    const { isDebug, logs, filters, setFilters, clear, export: exportLogs } = useBlackBox();
    const [isOpen, setIsOpen] = useState(initialOpen);
    const [selectedLog, setSelectedLog] = useState<BlackBoxEvent | null>(null);
  
    // Filter logs
    const filteredLogs = useMemo(() => {
      return logs
        .filter((log) => {
          // Type filter
          if (filters.types && filters.types.length > 0) {
            if (!filters.types.includes(log.type)) return false;
          }
          // Query filter (simple JSON string search)
          if (filters.query) {
            const query = filters.query.toLowerCase();
            try {
              if (!JSON.stringify(log).toLowerCase().includes(query)) {
                return false;
              }
            } catch (e) { /* ignore */ }
          }
          // Level filter for console logs
          if (filters.level && log.type === 'console') {
            if (log.level !== filters.level) return false;
          }
          // Time range filters
          if (filters.sinceTs && log.ts < filters.sinceTs) return false;
          if (filters.untilTs && log.ts > filters.untilTs) return false;
          return true;
        })
        .sort((a, b) => b.ts - a.ts); // Newest first
    }, [logs, filters]);
  
    if (!isDebug) {
      return null;
    }
  
    const toggleFilter = (type: BlackBoxEventType) => {
      const currentTypes = filters.types || [];
      const newTypes = currentTypes.includes(type)
        ? currentTypes.filter((t) => t !== type)
        : [...currentTypes, type];
      setFilters({ ...filters, types: newTypes });
    };
  
    const handleExport = () => {
      const data = JSON.stringify(exportLogs(), null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `blackbox-logs-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    };
  
    const getPositionStyle = (): React.CSSProperties => {
      const style: React.CSSProperties = { position: 'fixed', zIndex: 999998 };
      if (position.includes('bottom')) style.bottom = '20px';
      if (position.includes('top')) style.top = '20px';
      if (position.includes('right')) style.right = '20px';
      if (position.includes('left')) style.left = '20px';
      return style;
    };
  
    const getPanelStyle = (): React.CSSProperties => ({
      position: 'fixed',
      zIndex: 999999,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      height,
      width,
      backgroundColor: '#1a1a1a',
      color: '#e0e0e0',
      borderRadius: '8px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Menlo, monospace',
      fontSize: '13px',
    });
  
    const getLogColor = (type: BlackBoxEventType) => {
      switch (type) {
        case 'error':
        case 'react-error':
        case 'unhandled-rejection':
          return '#ff6b6b';
        case 'trace':
          return '#84b0ff';
        case 'network':
          return '#51cf66';
        case 'console':
          return '#f0c05a';
        default:
          return '#999';
      }
    };
  
    return (
      <>
        <style>{`
          /* Minimal styles for the UI */
          .bb-btn {
            background-color: #007aff;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 50px;
            cursor: pointer;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,122,255,0.4);
          }
          .bb-btn:hover {
            background-color: #0051d5;
          }
          .bb-panel-header {
            padding: 12px 16px;
            border-bottom: 1px solid #333;
            display: flex;
            gap: 8px;
            align-items: center;
            flex-wrap: wrap;
          }
          .bb-panel-body {
            flex-grow: 1;
            display: flex;
            overflow: hidden;
          }
          .bb-log-list {
            width: 40%;
            flex-shrink: 0;
            border-right: 1px solid #333;
            overflow-y: auto;
          }
          .bb-log-item {
            padding: 8px 12px;
            border-bottom: 1px solid #2a2a2a;
            cursor: pointer;
            font-size: 12px;
            line-height: 1.5;
          }
          .bb-log-item:hover { background-color: #2a2a2a; }
          .bb-log-item-selected { background-color: #007aff !important; color: white; }
          .bb-log-detail {
            flex-grow: 1;
            padding: 12px;
            overflow-y: auto;
          }
          .bb-log-detail pre {
            white-space: pre-wrap;
            word-break: break-all;
            font-size: 12px;
          }
          .bb-filter-input {
            background: #333;
            border: 1px solid #444;
            color: white;
            border-radius: 4px;
            padding: 4px 8px;
            font-family: inherit;
          }
          .bb-filter-btn {
            background: #333;
            border: 1px solid #444;
            color: #ccc;
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
          }
          .bb-filter-btn:hover {
            background: #444;
          }
          .bb-filter-btn-active {
            border-color: #007aff;
            color: #007aff;
            background: #007aff22;
          }
          .bb-action-btn {
            background: #444;
            border: 1px solid #555;
            color: #ccc;
            padding: 4px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
          }
          .bb-action-btn:hover {
            background: #555;
          }
        `}</style>
  
        {floating && !isOpen && (
          <button
            className="bb-btn"
            style={getPositionStyle()}
            onClick={() => setIsOpen(true)}
          >
            🐛 BlackBox ({logs.length})
          </button>
        )}
  
        {isOpen && (
          <div style={getPanelStyle()}>
            <header className="bb-panel-header">
              <strong style={{ fontSize: 16 }}>🐛 BlackBox</strong>
              <input
                type="text"
                placeholder="Filter..."
                className="bb-filter-input"
                value={filters.query || ''}
                onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              />
              {(['error', 'trace', 'network', 'console'] as BlackBoxEventType[]).map(type => (
                <button
                  key={type}
                  className={`bb-filter-btn ${filters.types?.includes(type) ? 'bb-filter-btn-active' : ''}`}
                  onClick={() => toggleFilter(type)}
                  style={{ color: getLogColor(type) }}
                >
                  {type}
                </button>
              ))}
              <button className="bb-action-btn" onClick={clear}>
                Clear
              </button>
              <button className="bb-action-btn" onClick={handleExport}>
                Export
              </button>
              <button
                style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#888', fontSize: 20, cursor: 'pointer' }}
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
            </header>
            <div className="bb-panel-body">
              <div className="bb-log-list">
                {filteredLogs.length === 0 && (
                  <div style={{ color: '#888', padding: 20, textAlign: 'center' }}>
                    No logs to display
                  </div>
                )}
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`bb-log-item ${selectedLog?.id === log.id ? 'bb-log-item-selected' : ''}`}
                    onClick={() => setSelectedLog(log)}
                  >
                    <div>
                      <span style={{ color: getLogColor(log.type), fontWeight: 600, marginRight: 8 }}>
                        {log.type}
                      </span>
                      <span style={{ color: '#666', fontSize: 10 }}>
                        {new Date(log.ts).toLocaleTimeString()}
                      </span>
                    </div>
                    <div style={{ marginTop: 4, color: '#ccc' }}>
                      {logMessagePreview(log)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="bb-log-detail">
                {selectedLog ? (
                  <pre>{JSON.stringify(selectedLog, null, 2)}</pre>
                ) : (
                  <div style={{ color: '#888', padding: 20, textAlign: 'center' }}>
                    Select a log to view details
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  };