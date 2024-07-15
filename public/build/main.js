
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
function noop() { }
function assign(tar, src) {
    // @ts-ignore
    for (const k in src)
        tar[k] = src[k];
    return tar;
}
function add_location(element, file, line, column, char) {
    element.__svelte_meta = {
        loc: { file, line, column, char }
    };
}
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function create_slot(definition, ctx, $$scope, fn) {
    if (definition) {
        const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
        return definition[0](slot_ctx);
    }
}
function get_slot_context(definition, ctx, $$scope, fn) {
    return definition[1] && fn
        ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
        : $$scope.ctx;
}
function get_slot_changes(definition, $$scope, dirty, fn) {
    if (definition[2] && fn) {
        const lets = definition[2](fn(dirty));
        if ($$scope.dirty === undefined) {
            return lets;
        }
        if (typeof lets === 'object') {
            const merged = [];
            const len = Math.max($$scope.dirty.length, lets.length);
            for (let i = 0; i < len; i += 1) {
                merged[i] = $$scope.dirty[i] | lets[i];
            }
            return merged;
        }
        return $$scope.dirty | lets;
    }
    return $$scope.dirty;
}

function append(target, node) {
    target.appendChild(node);
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    node.parentNode.removeChild(node);
}
function destroy_each(iterations, detaching) {
    for (let i = 0; i < iterations.length; i += 1) {
        if (iterations[i])
            iterations[i].d(detaching);
    }
}
function element(name) {
    return document.createElement(name);
}
function text(data) {
    return document.createTextNode(data);
}
function space() {
    return text(' ');
}
function empty() {
    return text('');
}
function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function children(element) {
    return Array.from(element.childNodes);
}
function set_style(node, key, value, important) {
    node.style.setProperty(key, value, important ? 'important' : '');
}
// unfortunately this can't be a constant as that wouldn't be tree-shakeable
// so we cache the result instead
let crossorigin;
function is_crossorigin() {
    if (crossorigin === undefined) {
        crossorigin = false;
        try {
            if (typeof window !== 'undefined' && window.parent) {
                void window.parent.document;
            }
        }
        catch (error) {
            crossorigin = true;
        }
    }
    return crossorigin;
}
function add_resize_listener(node, fn) {
    const computed_style = getComputedStyle(node);
    const z_index = (parseInt(computed_style.zIndex) || 0) - 1;
    if (computed_style.position === 'static') {
        node.style.position = 'relative';
    }
    const iframe = element('iframe');
    iframe.setAttribute('style', `display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ` +
        `overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: ${z_index};`);
    iframe.setAttribute('aria-hidden', 'true');
    iframe.tabIndex = -1;
    let unsubscribe;
    if (is_crossorigin()) {
        iframe.src = `data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>`;
        unsubscribe = listen(window, 'message', (event) => {
            if (event.source === iframe.contentWindow)
                fn();
        });
    }
    else {
        iframe.src = 'about:blank';
        iframe.onload = () => {
            unsubscribe = listen(iframe.contentWindow, 'resize', fn);
        };
    }
    append(node, iframe);
    return () => {
        detach(iframe);
        if (unsubscribe)
            unsubscribe();
    };
}
function toggle_class(element, name, toggle) {
    element.classList[toggle ? 'add' : 'remove'](name);
}
function custom_event(type, detail) {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, false, false, detail);
    return e;
}
class HtmlTag {
    constructor(html, anchor = null) {
        this.e = element('div');
        this.a = anchor;
        this.u(html);
    }
    m(target, anchor = null) {
        for (let i = 0; i < this.n.length; i += 1) {
            insert(target, this.n[i], anchor);
        }
        this.t = target;
    }
    u(html) {
        this.e.innerHTML = html;
        this.n = Array.from(this.e.childNodes);
    }
    p(html) {
        this.d();
        this.u(html);
        this.m(this.t, this.a);
    }
    d() {
        this.n.forEach(detach);
    }
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error(`Function called outside component initialization`);
    return current_component;
}
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}

const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
let flushing = false;
const seen_callbacks = new Set();
function flush() {
    if (flushing)
        return;
    flushing = true;
    do {
        // first, call beforeUpdate functions
        // and update components
        for (let i = 0; i < dirty_components.length; i += 1) {
            const component = dirty_components[i];
            set_current_component(component);
            update(component.$$);
        }
        dirty_components.length = 0;
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
                callback();
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
    flushing = false;
    seen_callbacks.clear();
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update();
        run_all($$.before_update);
        const dirty = $$.dirty;
        $$.dirty = [-1];
        $$.fragment && $$.fragment.p($$.ctx, dirty);
        $$.after_update.forEach(add_render_callback);
    }
}
const outroing = new Set();
let outros;
function group_outros() {
    outros = {
        r: 0,
        c: [],
        p: outros // parent group
    };
}
function check_outros() {
    if (!outros.r) {
        run_all(outros.c);
    }
    outros = outros.p;
}
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function transition_out(block, local, detach, callback) {
    if (block && block.o) {
        if (outroing.has(block))
            return;
        outroing.add(block);
        outros.c.push(() => {
            outroing.delete(block);
            if (callback) {
                if (detach)
                    block.d(1);
                callback();
            }
        });
        block.o(local);
    }
}
function create_component(block) {
    block && block.c();
}
function mount_component(component, target, anchor) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    // onMount happens before the initial afterUpdate
    add_render_callback(() => {
        const new_on_destroy = on_mount.map(run).filter(is_function);
        if (on_destroy) {
            on_destroy.push(...new_on_destroy);
        }
        else {
            // Edge case - component was destroyed immediately,
            // most likely as a result of a binding initialising
            run_all(new_on_destroy);
        }
        component.$$.on_mount = [];
    });
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        $$.on_destroy = $$.fragment = null;
        $$.ctx = [];
    }
}
function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty.fill(0);
    }
    component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
}
function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const prop_values = options.props || {};
    const $$ = component.$$ = {
        fragment: null,
        ctx: null,
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        before_update: [],
        after_update: [],
        context: new Map(parent_component ? parent_component.$$.context : []),
        // everything else
        callbacks: blank_object(),
        dirty
    };
    let ready = false;
    $$.ctx = instance
        ? instance(component, prop_values, (i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if ($$.bound[i])
                    $$.bound[i](value);
                if (ready)
                    make_dirty(component, i);
            }
            return ret;
        })
        : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
        if (options.hydrate) {
            const nodes = children(options.target);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.l(nodes);
            nodes.forEach(detach);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor);
        flush();
    }
    set_current_component(parent_component);
}
class SvelteComponent {
    $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
    }
    $on(type, callback) {
        const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
        callbacks.push(callback);
        return () => {
            const index = callbacks.indexOf(callback);
            if (index !== -1)
                callbacks.splice(index, 1);
        };
    }
    $set() {
        // overridden by instance, if it has props
    }
}

function dispatch_dev(type, detail) {
    document.dispatchEvent(custom_event(type, Object.assign({ version: '3.22.3' }, detail)));
}
function append_dev(target, node) {
    dispatch_dev("SvelteDOMInsert", { target, node });
    append(target, node);
}
function insert_dev(target, node, anchor) {
    dispatch_dev("SvelteDOMInsert", { target, node, anchor });
    insert(target, node, anchor);
}
function detach_dev(node) {
    dispatch_dev("SvelteDOMRemove", { node });
    detach(node);
}
function attr_dev(node, attribute, value) {
    attr(node, attribute, value);
    if (value == null)
        dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
    else
        dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
}
function set_data_dev(text, data) {
    data = '' + data;
    if (text.data === data)
        return;
    dispatch_dev("SvelteDOMSetData", { node: text, data });
    text.data = data;
}
function validate_each_argument(arg) {
    if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
        let msg = '{#each} only iterates over array-like objects.';
        if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
            msg += ' You can use a spread to convert this iterable into an array.';
        }
        throw new Error(msg);
    }
}
function validate_slots(name, slot, keys) {
    for (const slot_key of Object.keys(slot)) {
        if (!~keys.indexOf(slot_key)) {
            console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
        }
    }
}
class SvelteComponentDev extends SvelteComponent {
    constructor(options) {
        if (!options || (!options.target && !options.$$inline)) {
            throw new Error(`'target' is a required option`);
        }
        super();
    }
    $destroy() {
        super.$destroy();
        this.$destroy = () => {
            console.warn(`Component was already destroyed`); // eslint-disable-line no-console
        };
    }
    $capture_state() { }
    $inject_state() { }
}

const MAX_WIDTH = 1200;

/* src/Grid.svelte generated by Svelte v3.22.3 */
const file = "src/Grid.svelte";

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[10] = list[i].name;
	child_ctx[11] = list[i].image;
	child_ctx[12] = list[i].description;
	child_ctx[13] = list[i].tools;
	child_ctx[14] = list[i].url;
	child_ctx[15] = list[i].date;
	child_ctx[16] = list[i].repo;
	child_ctx[17] = list[i].data;
	child_ctx[19] = i;
	return child_ctx;
}

// (114:10) {:else}
function create_else_block(ctx) {
	let picture;
	let show_if = /*image*/ ctx[11].includes(".webp");
	let t;
	let img;
	let img_src_value;
	let img_alt_value;
	let if_block = show_if && create_if_block_6(ctx);

	const block = {
		c: function create() {
			picture = element("picture");
			if (if_block) if_block.c();
			t = space();
			img = element("img");
			if (img.src !== (img_src_value = /*image*/ ctx[11].replace(".webp", ".png"))) attr_dev(img, "src", img_src_value);
			attr_dev(img, "alt", img_alt_value = /*name*/ ctx[10]);
			attr_dev(img, "class", "svelte-p2qbv");
			add_location(img, file, 118, 14, 2375);
			add_location(picture, file, 114, 12, 2222);
		},
		m: function mount(target, anchor) {
			insert_dev(target, picture, anchor);
			if (if_block) if_block.m(picture, null);
			append_dev(picture, t);
			append_dev(picture, img);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*projects*/ 1) show_if = /*image*/ ctx[11].includes(".webp");

			if (show_if) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block_6(ctx);
					if_block.c();
					if_block.m(picture, t);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (dirty & /*projects*/ 1 && img.src !== (img_src_value = /*image*/ ctx[11].replace(".webp", ".png"))) {
				attr_dev(img, "src", img_src_value);
			}

			if (dirty & /*projects*/ 1 && img_alt_value !== (img_alt_value = /*name*/ ctx[10])) {
				attr_dev(img, "alt", img_alt_value);
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(picture);
			if (if_block) if_block.d();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_else_block.name,
		type: "else",
		source: "(114:10) {:else}",
		ctx
	});

	return block;
}

// (110:10) {#if image.includes('.mp4') || image.includes('.mov')}
function create_if_block_5(ctx) {
	let video;
	let source;
	let source_src_value;

	const block = {
		c: function create() {
			video = element("video");
			source = element("source");
			if (source.src !== (source_src_value = /*image*/ ctx[11])) attr_dev(source, "src", source_src_value);
			add_location(source, file, 111, 14, 2148);
			video.autoplay = true;
			video.playsInline = true;
			video.muted = true;
			video.loop = true;
			attr_dev(video, "class", "svelte-p2qbv");
			add_location(video, file, 110, 12, 2094);
		},
		m: function mount(target, anchor) {
			insert_dev(target, video, anchor);
			append_dev(video, source);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*projects*/ 1 && source.src !== (source_src_value = /*image*/ ctx[11])) {
				attr_dev(source, "src", source_src_value);
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(video);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_5.name,
		type: "if",
		source: "(110:10) {#if image.includes('.mp4') || image.includes('.mov')}",
		ctx
	});

	return block;
}

// (116:14) {#if image.includes('.webp')}
function create_if_block_6(ctx) {
	let source;
	let source_srcset_value;

	const block = {
		c: function create() {
			source = element("source");
			attr_dev(source, "srcset", source_srcset_value = "" + (/*image*/ ctx[11] + " 1x"));
			attr_dev(source, "type", "image/webp");
			add_location(source, file, 116, 16, 2292);
		},
		m: function mount(target, anchor) {
			insert_dev(target, source, anchor);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*projects*/ 1 && source_srcset_value !== (source_srcset_value = "" + (/*image*/ ctx[11] + " 1x"))) {
				attr_dev(source, "srcset", source_srcset_value);
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(source);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_6.name,
		type: "if",
		source: "(116:14) {#if image.includes('.webp')}",
		ctx
	});

	return block;
}

// (125:10) {#if date && date.length > 0}
function create_if_block_4(ctx) {
	let span;
	let t_value = /*date*/ ctx[15] + "";
	let t;

	const block = {
		c: function create() {
			span = element("span");
			t = text(t_value);
			attr_dev(span, "class", "meta svelte-p2qbv");
			add_location(span, file, 125, 12, 2572);
		},
		m: function mount(target, anchor) {
			insert_dev(target, span, anchor);
			append_dev(span, t);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*projects*/ 1 && t_value !== (t_value = /*date*/ ctx[15] + "")) set_data_dev(t, t_value);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(span);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_4.name,
		type: "if",
		source: "(125:10) {#if date && date.length > 0}",
		ctx
	});

	return block;
}

// (131:6) {#if repo}
function create_if_block_3(ctx) {
	let span;
	let a;
	let t;
	let a_href_value;

	const block = {
		c: function create() {
			span = element("span");
			a = element("a");
			t = text("[repo]");
			attr_dev(a, "href", a_href_value = "https://github.com/graphicsdesk/" + /*repo*/ ctx[16]);
			attr_dev(a, "class", "svelte-p2qbv");
			add_location(a, file, 132, 10, 2705);
			attr_dev(span, "class", "meta git svelte-p2qbv");
			add_location(span, file, 131, 8, 2671);
		},
		m: function mount(target, anchor) {
			insert_dev(target, span, anchor);
			append_dev(span, a);
			append_dev(a, t);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*projects*/ 1 && a_href_value !== (a_href_value = "https://github.com/graphicsdesk/" + /*repo*/ ctx[16])) {
				attr_dev(a, "href", a_href_value);
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(span);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_3.name,
		type: "if",
		source: "(131:6) {#if repo}",
		ctx
	});

	return block;
}

// (136:6) {#if data}
function create_if_block_2(ctx) {
	let span;
	let a;
	let t;
	let a_href_value;

	const block = {
		c: function create() {
			span = element("span");
			a = element("a");
			t = text("[data]");
			attr_dev(a, "href", a_href_value = "https://github.com/graphicsdesk/" + /*data*/ ctx[17]);
			attr_dev(a, "class", "svelte-p2qbv");
			add_location(a, file, 137, 10, 2852);
			attr_dev(span, "class", "meta git svelte-p2qbv");
			add_location(span, file, 136, 8, 2818);
		},
		m: function mount(target, anchor) {
			insert_dev(target, span, anchor);
			append_dev(span, a);
			append_dev(a, t);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*projects*/ 1 && a_href_value !== (a_href_value = "https://github.com/graphicsdesk/" + /*data*/ ctx[17])) {
				attr_dev(a, "href", a_href_value);
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(span);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_2.name,
		type: "if",
		source: "(136:6) {#if data}",
		ctx
	});

	return block;
}

// (142:6) {#if description}
function create_if_block_1(ctx) {
	let p;
	let br;
	let i;
	let t_value = /*description*/ ctx[12] + "";
	let t;

	const block = {
		c: function create() {
			p = element("p");
			br = element("br");
			i = element("i");
			t = text(t_value);
			add_location(br, file, 142, 31, 2996);
			add_location(i, file, 142, 35, 3000);
			attr_dev(p, "class", "description svelte-p2qbv");
			add_location(p, file, 142, 8, 2973);
		},
		m: function mount(target, anchor) {
			insert_dev(target, p, anchor);
			append_dev(p, br);
			append_dev(p, i);
			append_dev(i, t);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*projects*/ 1 && t_value !== (t_value = /*description*/ ctx[12] + "")) set_data_dev(t, t_value);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(p);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1.name,
		type: "if",
		source: "(142:6) {#if description}",
		ctx
	});

	return block;
}

// (146:6) {#if tools}
function create_if_block(ctx) {
	let p;
	let br;
	let b;
	let t1_value = /*tools*/ ctx[13] + "";
	let t1;

	const block = {
		c: function create() {
			p = element("p");
			br = element("br");
			b = element("b");
			b.textContent = "Tools I used: ";
			t1 = text(t1_value);
			add_location(br, file, 146, 25, 3081);
			add_location(b, file, 146, 29, 3085);
			attr_dev(p, "class", "tools svelte-p2qbv");
			add_location(p, file, 146, 8, 3064);
		},
		m: function mount(target, anchor) {
			insert_dev(target, p, anchor);
			append_dev(p, br);
			append_dev(p, b);
			append_dev(p, t1);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*projects*/ 1 && t1_value !== (t1_value = /*tools*/ ctx[13] + "")) set_data_dev(t1, t1_value);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(p);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block.name,
		type: "if",
		source: "(146:6) {#if tools}",
		ctx
	});

	return block;
}

// (106:2) {#each projects as { name, image, description, tools, url, date, repo, data }
function create_each_block(ctx) {
	let div1;
	let a;
	let div0;
	let show_if;
	let t0;
	let p;
	let html_tag;
	let raw_value = /*name*/ ctx[10] + "";
	let t1;
	let a_href_value;
	let t2;
	let t3;
	let t4;
	let t5;
	let t6;

	function select_block_type(ctx, dirty) {
		if (show_if == null || dirty & /*projects*/ 1) show_if = !!(/*image*/ ctx[11].includes(".mp4") || /*image*/ ctx[11].includes(".mov"));
		if (show_if) return create_if_block_5;
		return create_else_block;
	}

	let current_block_type = select_block_type(ctx, -1);
	let if_block0 = current_block_type(ctx);
	let if_block1 = /*date*/ ctx[15] && /*date*/ ctx[15].length > 0 && create_if_block_4(ctx);
	let if_block2 = /*repo*/ ctx[16] && create_if_block_3(ctx);
	let if_block3 = /*data*/ ctx[17] && create_if_block_2(ctx);
	let if_block4 = /*description*/ ctx[12] && create_if_block_1(ctx);
	let if_block5 = /*tools*/ ctx[13] && create_if_block(ctx);

	const block = {
		c: function create() {
			div1 = element("div");
			a = element("a");
			div0 = element("div");
			if_block0.c();
			t0 = space();
			p = element("p");
			t1 = space();
			if (if_block1) if_block1.c();
			t2 = space();
			if (if_block2) if_block2.c();
			t3 = space();
			if (if_block3) if_block3.c();
			t4 = space();
			if (if_block4) if_block4.c();
			t5 = space();
			if (if_block5) if_block5.c();
			t6 = space();
			attr_dev(div0, "class", "media svelte-p2qbv");
			set_style(div0, "height", Math.round(/*mediaHeight*/ ctx[3]) + "px");
			add_location(div0, file, 108, 8, 1953);
			html_tag = new HtmlTag(raw_value, t1);
			attr_dev(p, "class", "svelte-p2qbv");
			add_location(p, file, 122, 8, 2493);
			attr_dev(a, "href", a_href_value = /*url*/ ctx[14]);
			attr_dev(a, "target", "_blank");
			set_style(a, "color", /*color*/ ctx[5](/*index*/ ctx[19]));
			add_location(a, file, 107, 6, 1884);
			add_location(div1, file, 106, 4, 1872);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div1, anchor);
			append_dev(div1, a);
			append_dev(a, div0);
			if_block0.m(div0, null);
			append_dev(a, t0);
			append_dev(a, p);
			html_tag.m(p);
			append_dev(p, t1);
			if (if_block1) if_block1.m(p, null);
			append_dev(div1, t2);
			if (if_block2) if_block2.m(div1, null);
			append_dev(div1, t3);
			if (if_block3) if_block3.m(div1, null);
			append_dev(div1, t4);
			if (if_block4) if_block4.m(div1, null);
			append_dev(div1, t5);
			if (if_block5) if_block5.m(div1, null);
			append_dev(div1, t6);
		},
		p: function update(ctx, dirty) {
			if (current_block_type === (current_block_type = select_block_type(ctx, dirty)) && if_block0) {
				if_block0.p(ctx, dirty);
			} else {
				if_block0.d(1);
				if_block0 = current_block_type(ctx);

				if (if_block0) {
					if_block0.c();
					if_block0.m(div0, null);
				}
			}

			if (dirty & /*mediaHeight*/ 8) {
				set_style(div0, "height", Math.round(/*mediaHeight*/ ctx[3]) + "px");
			}

			if (dirty & /*projects*/ 1 && raw_value !== (raw_value = /*name*/ ctx[10] + "")) html_tag.p(raw_value);

			if (/*date*/ ctx[15] && /*date*/ ctx[15].length > 0) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block_4(ctx);
					if_block1.c();
					if_block1.m(p, null);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (dirty & /*projects*/ 1 && a_href_value !== (a_href_value = /*url*/ ctx[14])) {
				attr_dev(a, "href", a_href_value);
			}

			if (/*repo*/ ctx[16]) {
				if (if_block2) {
					if_block2.p(ctx, dirty);
				} else {
					if_block2 = create_if_block_3(ctx);
					if_block2.c();
					if_block2.m(div1, t3);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}

			if (/*data*/ ctx[17]) {
				if (if_block3) {
					if_block3.p(ctx, dirty);
				} else {
					if_block3 = create_if_block_2(ctx);
					if_block3.c();
					if_block3.m(div1, t4);
				}
			} else if (if_block3) {
				if_block3.d(1);
				if_block3 = null;
			}

			if (/*description*/ ctx[12]) {
				if (if_block4) {
					if_block4.p(ctx, dirty);
				} else {
					if_block4 = create_if_block_1(ctx);
					if_block4.c();
					if_block4.m(div1, t5);
				}
			} else if (if_block4) {
				if_block4.d(1);
				if_block4 = null;
			}

			if (/*tools*/ ctx[13]) {
				if (if_block5) {
					if_block5.p(ctx, dirty);
				} else {
					if_block5 = create_if_block(ctx);
					if_block5.c();
					if_block5.m(div1, t6);
				}
			} else if (if_block5) {
				if_block5.d(1);
				if_block5 = null;
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div1);
			if_block0.d();
			if (if_block1) if_block1.d();
			if (if_block2) if_block2.d();
			if (if_block3) if_block3.d();
			if (if_block4) if_block4.d();
			if (if_block5) if_block5.d();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block.name,
		type: "each",
		source: "(106:2) {#each projects as { name, image, description, tools, url, date, repo, data }",
		ctx
	});

	return block;
}

function create_fragment(ctx) {
	let div;
	let div_style_value;
	let div_resize_listener;
	let each_value = /*projects*/ ctx[0];
	validate_each_argument(each_value);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	const block = {
		c: function create() {
			div = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr_dev(div, "class", "grid svelte-p2qbv");
			attr_dev(div, "style", div_style_value = "grid-template-columns: " + /*gridColumns*/ ctx[4] + "; column-gap: " + (/*columns*/ ctx[1] > 1 ? columnGap : 0) + "px;\n  " + (/*columns*/ ctx[1] === 1 && "text-align: center"));
			add_render_callback(() => /*div_elementresize_handler*/ ctx[9].call(div));
			add_location(div, file, 99, 0, 1604);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}

			div_resize_listener = add_resize_listener(div, /*div_elementresize_handler*/ ctx[9].bind(div));
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*projects, color, Math, mediaHeight*/ 41) {
				each_value = /*projects*/ ctx[0];
				validate_each_argument(each_value);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}

			if (dirty & /*gridColumns, columns*/ 18 && div_style_value !== (div_style_value = "grid-template-columns: " + /*gridColumns*/ ctx[4] + "; column-gap: " + (/*columns*/ ctx[1] > 1 ? columnGap : 0) + "px;\n  " + (/*columns*/ ctx[1] === 1 && "text-align: center"))) {
				attr_dev(div, "style", div_style_value);
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			destroy_each(each_blocks, detaching);
			div_resize_listener();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

let totalItems = 0;
const columnGap = 18;

function instance($$self, $$props, $$invalidate) {
	let { projects } = $$props;
	let { columns = 3 } = $$props;
	let colorOffset = totalItems;
	totalItems += projects.length;
	const colors = ["#f90095"];
	const minFr = 500 - 100 * columns;
	let clientWidth, mediaHeight, gridColumns;
	const color = index => colors[(colorOffset + index) % colors.length];
	const writable_props = ["projects", "columns"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Grid> was created with unknown prop '${key}'`);
	});

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("Grid", $$slots, []);

	function div_elementresize_handler() {
		clientWidth = this.clientWidth;
		$$invalidate(2, clientWidth);
	}

	$$self.$set = $$props => {
		if ("projects" in $$props) $$invalidate(0, projects = $$props.projects);
		if ("columns" in $$props) $$invalidate(1, columns = $$props.columns);
	};

	$$self.$capture_state = () => ({
		totalItems,
		MAX_WIDTH,
		projects,
		columns,
		colorOffset,
		colors,
		minFr,
		columnGap,
		clientWidth,
		mediaHeight,
		gridColumns,
		color
	});

	$$self.$inject_state = $$props => {
		if ("projects" in $$props) $$invalidate(0, projects = $$props.projects);
		if ("columns" in $$props) $$invalidate(1, columns = $$props.columns);
		if ("colorOffset" in $$props) colorOffset = $$props.colorOffset;
		if ("clientWidth" in $$props) $$invalidate(2, clientWidth = $$props.clientWidth);
		if ("mediaHeight" in $$props) $$invalidate(3, mediaHeight = $$props.mediaHeight);
		if ("gridColumns" in $$props) $$invalidate(4, gridColumns = $$props.gridColumns);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*clientWidth, columns*/ 6) {
			 {
				let fr = (clientWidth - columnGap * (columns - 1)) / columns; // 1fr

				if (fr < minFr) {
					fr = clientWidth;
					$$invalidate(4, gridColumns = "1fr");
				} else if (fr < minFr + 100) {
					fr = (clientWidth - columnGap * (2 - 1)) / 2;
					$$invalidate(4, gridColumns = "1fr 1fr");
				} else {
					$$invalidate(4, gridColumns = ("1fr ").repeat(columns));
				}

				$$invalidate(3, mediaHeight = fr * (2 / 3));
			}
		}
	};

	return [
		projects,
		columns,
		clientWidth,
		mediaHeight,
		gridColumns,
		color,
		colorOffset,
		colors,
		minFr,
		div_elementresize_handler
	];
}

class Grid extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance, create_fragment, safe_not_equal, { projects: 0, columns: 1 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Grid",
			options,
			id: create_fragment.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*projects*/ ctx[0] === undefined && !("projects" in props)) {
			console.warn("<Grid> was created without expected prop 'projects'");
		}
	}

	get projects() {
		throw new Error("<Grid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set projects(value) {
		throw new Error("<Grid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get columns() {
		throw new Error("<Grid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set columns(value) {
		throw new Error("<Grid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/SectionHeader.svelte generated by Svelte v3.22.3 */

const file$1 = "src/SectionHeader.svelte";

// (38:0) {#if !hideHr}
function create_if_block_1$1(ctx) {
	let hr;

	const block = {
		c: function create() {
			hr = element("hr");
			attr_dev(hr, "id", /*id*/ ctx[0]);
			attr_dev(hr, "class", "svelte-3z7kxd");
			add_location(hr, file$1, 38, 2, 620);
		},
		m: function mount(target, anchor) {
			insert_dev(target, hr, anchor);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*id*/ 1) {
				attr_dev(hr, "id", /*id*/ ctx[0]);
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(hr);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1$1.name,
		type: "if",
		source: "(38:0) {#if !hideHr}",
		ctx
	});

	return block;
}

// (41:0) {#if !empty}
function create_if_block$1(ctx) {
	let p;
	let t;
	let current;
	const default_slot_template = /*$$slots*/ ctx[5].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

	const block = {
		c: function create() {
			p = element("p");
			if (default_slot) default_slot.c();
			t = text(":");
			attr_dev(p, "class", "svelte-3z7kxd");
			toggle_class(p, "centered", /*centered*/ ctx[3]);
			add_location(p, file$1, 41, 2, 653);
		},
		m: function mount(target, anchor) {
			insert_dev(target, p, anchor);

			if (default_slot) {
				default_slot.m(p, null);
			}

			append_dev(p, t);
			current = true;
		},
		p: function update(ctx, dirty) {
			if (default_slot) {
				if (default_slot.p && dirty & /*$$scope*/ 16) {
					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[4], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null));
				}
			}

			if (dirty & /*centered*/ 8) {
				toggle_class(p, "centered", /*centered*/ ctx[3]);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(p);
			if (default_slot) default_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$1.name,
		type: "if",
		source: "(41:0) {#if !empty}",
		ctx
	});

	return block;
}

function create_fragment$1(ctx) {
	let t;
	let if_block1_anchor;
	let current;
	let if_block0 = !/*hideHr*/ ctx[2] && create_if_block_1$1(ctx);
	let if_block1 = !/*empty*/ ctx[1] && create_if_block$1(ctx);

	const block = {
		c: function create() {
			if (if_block0) if_block0.c();
			t = space();
			if (if_block1) if_block1.c();
			if_block1_anchor = empty();
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			if (if_block0) if_block0.m(target, anchor);
			insert_dev(target, t, anchor);
			if (if_block1) if_block1.m(target, anchor);
			insert_dev(target, if_block1_anchor, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			if (!/*hideHr*/ ctx[2]) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_1$1(ctx);
					if_block0.c();
					if_block0.m(t.parentNode, t);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (!/*empty*/ ctx[1]) {
				if (if_block1) {
					if_block1.p(ctx, dirty);

					if (dirty & /*empty*/ 2) {
						transition_in(if_block1, 1);
					}
				} else {
					if_block1 = create_if_block$1(ctx);
					if_block1.c();
					transition_in(if_block1, 1);
					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
				}
			} else if (if_block1) {
				group_outros();

				transition_out(if_block1, 1, 1, () => {
					if_block1 = null;
				});

				check_outros();
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block1);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block1);
			current = false;
		},
		d: function destroy(detaching) {
			if (if_block0) if_block0.d(detaching);
			if (detaching) detach_dev(t);
			if (if_block1) if_block1.d(detaching);
			if (detaching) detach_dev(if_block1_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$1.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$1($$self, $$props, $$invalidate) {
	let { id = undefined } = $$props;
	let { empty = false } = $$props;
	let { hideHr = false } = $$props;
	let { centered = false } = $$props;
	const writable_props = ["id", "empty", "hideHr", "centered"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SectionHeader> was created with unknown prop '${key}'`);
	});

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("SectionHeader", $$slots, ['default']);

	$$self.$set = $$props => {
		if ("id" in $$props) $$invalidate(0, id = $$props.id);
		if ("empty" in $$props) $$invalidate(1, empty = $$props.empty);
		if ("hideHr" in $$props) $$invalidate(2, hideHr = $$props.hideHr);
		if ("centered" in $$props) $$invalidate(3, centered = $$props.centered);
		if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
	};

	$$self.$capture_state = () => ({ id, empty, hideHr, centered });

	$$self.$inject_state = $$props => {
		if ("id" in $$props) $$invalidate(0, id = $$props.id);
		if ("empty" in $$props) $$invalidate(1, empty = $$props.empty);
		if ("hideHr" in $$props) $$invalidate(2, hideHr = $$props.hideHr);
		if ("centered" in $$props) $$invalidate(3, centered = $$props.centered);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [id, empty, hideHr, centered, $$scope, $$slots];
}

class SectionHeader extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$1, create_fragment$1, safe_not_equal, { id: 0, empty: 1, hideHr: 2, centered: 3 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "SectionHeader",
			options,
			id: create_fragment$1.name
		});
	}

	get id() {
		throw new Error("<SectionHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set id(value) {
		throw new Error("<SectionHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get empty() {
		throw new Error("<SectionHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set empty(value) {
		throw new Error("<SectionHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get hideHr() {
		throw new Error("<SectionHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set hideHr(value) {
		throw new Error("<SectionHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get centered() {
		throw new Error("<SectionHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set centered(value) {
		throw new Error("<SectionHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

var projects = {
  topLevel: [
    {
      name:
        'Police Helicopter Flights and Spending Soar in New York City',
     image: 'images/helicopter-thumbnail.jpg',
      url:
        'https://www.bloomberg.com/graphics/2024-nyc-police-helicopter-flights/',
      tools: 'Python, GIS, Illustrator'
    },
    {
      name:
        'Goodbye Chairman, Hello Chair. The Gendered Title Is Fading Away',
     image: 'images/gender-neutral-animation.mov',
      url:
        'https://www.bloomberg.com/graphics/2024-gender-neutral-board-titles-us-companies/?terminal=1',
      tools: 'D3, Svelte, Illustrator'
    },
    {
      name:
        'Corporate America Promised to Hire a Lot More People of Color. It Actually Did.',
     //image: 'images/eeo1-diversity.mov',
     image: 'images/eeo1-screengrab-2.jpg',
      url:
        'https://www.bloomberg.com/graphics/2023-black-lives-matter-equal-opportunity-corporate-diversity/',
      tools: 'R, Illustrator, Svelte'
    },
    {
      name:
        'New York and California Each Lost $1 Trillion When Financial Firms Moved South',
      image: 'images/asset-maps.jpg',
      // image: 'images/celeb-scroll.mov',
      url:
        'https://www.bloomberg.com/graphics/2023-asset-management-relocation-wall-street-south/?terminal=1',
      description: 'Shoutout to our former intern, Jade!',
      tools: 'QGIS, Python, Illustrator'
    },
    {
      name:
        'The Golden Era of Celebrity Beauty Brands Is Ending',
      //image: 'images/celeb-static.jpg',
      image: 'images/celeb-scroll.mov',
      url:
        'https://www.bloomberg.com/graphics/2023-celebrity-beauty-brands-makeup-skincare/?terminal=1',
      tools: 'Svelte, Photoshop, Illustrator, SVG'
    },
    {
      name:
        'Small Gunmakers Find State Weapons Bans Offer a Lucrative Niche',
      image: 'images/gun-static.jpg',
      url:
        'https://www.bloomberg.com/graphics/2022-gun-manufacturing/?terminal=1',
      tools: 'QGIS, Photoshop, Illustrator, Excel'
    },
    {
      name:
        'A New Era of Climate Disasters Revives Calls for Climate Reparations',
      image: 'images/flood-map.mov',
      url:
        'https://www.bloomberg.com/graphics/2022-pakistan-floods-climate-change-loss-damage-cop27/?terminal=1',
      tools: 'Google Earth Engine, Copernicus Open Access Hub, QGIS, Illustrator, HTML/CSS, JS',

    },
    {
      name:
        'Harvard’s Status as Wealthiest School Faces Oil-Rich Contender in the University of Texas',
      image: 'images/drone.mp4',
      url:
        'https://www.bloomberg.com/graphics/2022-harvard-university-of-texas-richest-college-oil-endowments/?terminal=1',
      tools: 'QGIS, Photoshop, Illustrator',
    },
    {
      name:
        'Fear of Rampant Crime Is Derailing New York City’s Recovery',
      image: 'images/media-mismatch.jpg',
      url:
        'https://www.bloomberg.com/graphics/2022-is-nyc-safe-crime-stat-reality/',
      tools: 'Svelte, Illustrator, Python, Apache Solr',
    },
    {
      name:
        'Supreme Court Ruling Jeopardizes Abortion Access for 33 Million Women',
      image: 'images/abortion-hover.mov',
      url:
        'https://www.bloomberg.com/graphics/2022-supreme-court-roe-v-wade-abortion-access/?terminal=1',
    },
    {
      name:
        'Half of Russia’s 20 Richest Billionaires Are Not Sanctioned',
      image: 'images/sanctions.mov',
      url:
        'https://www.bloomberg.com/graphics/2022-russian-billionaires-sanctioned-ukraine-war/?terminal=1',
      tools: 'Excel, Python, Svelte, Illustrator',
    },
    {
      name:
        'Interview with the South China Morning Post Infographics Team',
      image: 'images/scmp.jpg',
      url:
        'https://nightingaledvs.com/on-the-success-of-the-south-china-morning-post-infographics-team/',
      description: 'Remembering Darren Long.',
    },
    {
      name:
        'Adams Won By Betting on a New York Divided By Race and Income',
      image: 'images/city.jpg',
      url:
        'https://www.bloomberg.com/graphics/2021-nyc-mayoral-analysis/?terminal=1',
      tools: 'QGIS, Excel, Python, Illustrator',
    },

    {
      name:
        'The U.S. and Ivy League schools were late to respond to COVID-19. Data shows international universities did better.',
      repo: 'ivy-coronavirus-response',
      data: 'covid-cases',
      image:
        'https://cloudfront-us-east-1.images.arcpublishing.com/spectator/Q4S24TEP2ZFTNH6P245MIKDQYY.gif',
      url:
        'https://www.columbiaspectator.com/news/2020/04/13/the-us-and-ivy-league-schools-were-late-to-respond-to-covid-19-data-shows-international-universities-did-better/',
      },
    {
      name:
        'Spectator Publishing Company&#39s 2019 Diversity Report',
      image:
        'images/diversity-report.gif',
      url:
        'http://www.specpublishing.com/diversity-report',
    },
  ]
};

/* src/App.svelte generated by Svelte v3.22.3 */
const file$2 = "src/App.svelte";

function get_each_context$1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[3] = list[i];
	return child_ctx;
}

// (43:0) {#each confetti as c}
function create_each_block$1(ctx) {
	let emoji;
	let t_value = /*c*/ ctx[3].character + "";
	let t;

	const block = {
		c: function create() {
			emoji = element("emoji");
			t = text(t_value);
			set_style(emoji, "left", /*c*/ ctx[3].x + "%");
			set_style(emoji, "top", /*c*/ ctx[3].y + "%");
			attr_dev(emoji, "class", "svelte-15il7ul");
			add_location(emoji, file$2, 43, 1, 850);
		},
		m: function mount(target, anchor) {
			insert_dev(target, emoji, anchor);
			append_dev(emoji, t);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*confetti*/ 1 && t_value !== (t_value = /*c*/ ctx[3].character + "")) set_data_dev(t, t_value);

			if (dirty & /*confetti*/ 1) {
				set_style(emoji, "left", /*c*/ ctx[3].x + "%");
			}

			if (dirty & /*confetti*/ 1) {
				set_style(emoji, "top", /*c*/ ctx[3].y + "%");
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(emoji);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block$1.name,
		type: "each",
		source: "(43:0) {#each confetti as c}",
		ctx
	});

	return block;
}

function create_fragment$2(ctx) {
	let t0;
	let main;
	let header;
	let div0;
	let p0;
	let b0;
	let t2;
	let div1;
	let p1;
	let a0;
	let t4;
	let p2;
	let t5;
	let a1;
	let b1;
	let t7;
	let t8;
	let p3;
	let t10;
	let p4;
	let t11;
	let a2;
	let t13;
	let t14;
	let br;
	let t15;
	let t16;
	let footer;
	let t17;
	let p5;
	let t18;
	let a3;
	let t20;
	let span;
	let current;
	let each_value = /*confetti*/ ctx[0];
	validate_each_argument(each_value);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
	}

	const grid = new Grid({
			props: { projects: projects.topLevel },
			$$inline: true
		});

	const sectionheader = new SectionHeader({ props: { empty: true }, $$inline: true });

	const block = {
		c: function create() {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t0 = space();
			main = element("main");
			header = element("header");
			div0 = element("div");
			p0 = element("p");
			b0 = element("b");
			b0.textContent = "Raeedah Wahid";
			t2 = space();
			div1 = element("div");
			p1 = element("p");
			a0 = element("a");
			a0.textContent = "Resume (+ awards)";
			t4 = space();
			p2 = element("p");
			t5 = text("Data and graphics person at ");
			a1 = element("a");
			b1 = element("b");
			b1.textContent = "Bloomberg";
			t7 = text(".");
			t8 = space();
			p3 = element("p");
			p3.textContent = "I live in New York City. I studied computer science on the Vision and Graphics track at Barnard College and Columbia University. (Also, human rights.)";
			t10 = space();
			p4 = element("p");
			t11 = text("Most recently, I was on the team recognized as a ");
			a2 = element("a");
			a2.textContent = "2024 Pulitzer Prize Finalist in Explantory Reporting";
			t13 = text(".");
			t14 = space();
			br = element("br");
			t15 = space();
			create_component(grid.$$.fragment);
			t16 = space();
			footer = element("footer");
			create_component(sectionheader.$$.fragment);
			t17 = space();
			p5 = element("p");
			t18 = text("Made under the ");
			a3 = element("a");
			a3.textContent = "Creative Commons Attribution-ShareAlike 4.0 International License";
			t20 = text(". Updated July 2024. ");
			span = element("span");
			add_location(b0, file$2, 151, 8, 2455);
			add_location(p0, file$2, 150, 6, 2443);
			attr_dev(div0, "class", "svelte-15il7ul");
			add_location(div0, file$2, 149, 4, 2431);
			attr_dev(a0, "href", "https://drive.google.com/file/d/17cay8LiKDV1kjAgBKaOdohGgVRDXOAgY/view?usp=sharing");
			attr_dev(a0, "target", "_blank");
			attr_dev(a0, "class", "svelte-15il7ul");
			add_location(a0, file$2, 155, 24, 2532);
			attr_dev(p1, "class", "resume svelte-15il7ul");
			add_location(p1, file$2, 155, 6, 2514);
			attr_dev(div1, "class", "svelte-15il7ul");
			add_location(div1, file$2, 154, 4, 2502);
			attr_dev(header, "class", "svelte-15il7ul");
			add_location(header, file$2, 148, 2, 2418);
			add_location(b1, file$2, 159, 136, 2827);
			attr_dev(a1, "href", "https://www.bloomberg.com/authors/AVRj3DR7f7s/raeedah-wahid");
			attr_dev(a1, "target", "_blank");
			add_location(a1, file$2, 159, 50, 2741);
			attr_dev(p2, "class", "nutgraf svelte-15il7ul");
			add_location(p2, file$2, 159, 2, 2693);
			attr_dev(p3, "class", "nutgraf svelte-15il7ul");
			add_location(p3, file$2, 160, 2, 2855);
			set_style(a2, "font-weight", "700");
			set_style(a2, "color", "#444");
			attr_dev(a2, "href", "https://www.pulitzer.org/finalists/staff-bloomberg");
			attr_dev(a2, "target", "_blank");
			add_location(a2, file$2, 161, 70, 3101);
			attr_dev(p4, "class", "nutgraf svelte-15il7ul");
			add_location(p4, file$2, 161, 2, 3033);
			add_location(br, file$2, 172, 2, 5396);
			set_style(a3, "color", "#666");
			attr_dev(a3, "href", "http://creativecommons.org/licenses/by-sa/4.0/");
			add_location(a3, file$2, 179, 141, 5624);
			set_style(span, "text-transform", "none");
			add_location(span, file$2, 179, 307, 5790);
			attr_dev(p5, "class", "updated-text svelte-15il7ul");
			set_style(p5, "padding-bottom", "2%");
			set_style(p5, "font-size", "14px");
			set_style(p5, "color", "#666");
			set_style(p5, "font-family", "'IBM Plex Mono', monospace");
			add_location(p5, file$2, 179, 4, 5487);
			attr_dev(footer, "class", "svelte-15il7ul");
			add_location(footer, file$2, 177, 2, 5446);
			set_style(main, "max-width", MAX_WIDTH + "px");
			attr_dev(main, "class", "svelte-15il7ul");
			add_location(main, file$2, 146, 0, 2375);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insert_dev(target, t0, anchor);
			insert_dev(target, main, anchor);
			append_dev(main, header);
			append_dev(header, div0);
			append_dev(div0, p0);
			append_dev(p0, b0);
			append_dev(header, t2);
			append_dev(header, div1);
			append_dev(div1, p1);
			append_dev(p1, a0);
			append_dev(main, t4);
			append_dev(main, p2);
			append_dev(p2, t5);
			append_dev(p2, a1);
			append_dev(a1, b1);
			append_dev(p2, t7);
			append_dev(main, t8);
			append_dev(main, p3);
			append_dev(main, t10);
			append_dev(main, p4);
			append_dev(p4, t11);
			append_dev(p4, a2);
			append_dev(p4, t13);
			append_dev(main, t14);
			append_dev(main, br);
			append_dev(main, t15);
			mount_component(grid, main, null);
			append_dev(main, t16);
			append_dev(main, footer);
			mount_component(sectionheader, footer, null);
			append_dev(footer, t17);
			append_dev(footer, p5);
			append_dev(p5, t18);
			append_dev(p5, a3);
			append_dev(p5, t20);
			append_dev(p5, span);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*confetti*/ 1) {
				each_value = /*confetti*/ ctx[0];
				validate_each_argument(each_value);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$1(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block$1(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(t0.parentNode, t0);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(grid.$$.fragment, local);
			transition_in(sectionheader.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(grid.$$.fragment, local);
			transition_out(sectionheader.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_each(each_blocks, detaching);
			if (detaching) detach_dev(t0);
			if (detaching) detach_dev(main);
			destroy_component(grid);
			destroy_component(sectionheader);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$2.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$2($$self, $$props, $$invalidate) {
	let contactFocused = false;
	let characters = ["✨"];

	let confetti = new Array(20).fill().map((_, i) => {
		return {
			character: characters[i % characters.length],
			x: Math.random() * 100,
			y: -20 - Math.random() * 100,
			r: 0.1 + Math.random() * 1
		};
	}).sort((a, b) => a.r - b.r);

	onMount(() => {
		let frame;

		function loop() {
			frame = requestAnimationFrame(loop);

			$$invalidate(0, confetti = confetti.map(emoji => {
				emoji.y += 0.5 * emoji.r;
				if (emoji.y > 240) emoji.y = -20;
				return emoji;
			}));
		}

		loop();
		return () => cancelAnimationFrame(frame);
	});

	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
	});

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("App", $$slots, []);

	$$self.$capture_state = () => ({
		Grid,
		SectionHeader,
		MAX_WIDTH,
		projects,
		onMount,
		contactFocused,
		characters,
		confetti
	});

	$$self.$inject_state = $$props => {
		if ("contactFocused" in $$props) contactFocused = $$props.contactFocused;
		if ("characters" in $$props) characters = $$props.characters;
		if ("confetti" in $$props) $$invalidate(0, confetti = $$props.confetti);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [confetti];
}

class App extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "App",
			options,
			id: create_fragment$2.name
		});
	}
}

function main () {
  if (!('scrollBehavior' in document.documentElement.style)) {
    import('./index-66ee4874.js').then();
  }

  new App({
    target: document.body,
  });
}

export default main;
//# sourceMappingURL=main.js.map
