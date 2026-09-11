/**
 * H5P hub UX patch — editor iframe дотор (болон parent-д хоргүй) ажиллана.
 *
 * 1. Жагсаалтын "Сонгох" товч → дэлгэрэнгүй хуудсыг алгасаж шууд "Ашиглах"-ийг
 *    автоматаар дарна (шаардлагатай бол эхлээд суулгана). Энэ үед detail
 *    түр нуугдаж гялсхийлт гарахгүй (html.h5p-autouse + CSS).
 * 2. Карт бүрийн баруун дээд буланд info (i) товч нэмнэ — дарахад төрлийн
 *    нэрийг parent руу postMessage-ээр дамжуулж, parent талын iView Modal
 *    дэлгэрэнгүйг харуулна (builder editor.vue).
 */
(function () {
    var root = document.documentElement;
    if (!root) return;

    var autoUseTimer = null;

    function stopAutoUse() {
        if (autoUseTimer) {
            clearInterval(autoUseTimer);
            autoUseTimer = null;
        }
        root.classList.remove('h5p-autouse');
    }

    /**
     * Detail нээгдмэгц "Ашиглах"-ийг (шаардлагатай бол эхлээд "Суулгах"-ийг)
     * олж дарна. 150ms тутам шалгаж, deadline хэтэрвэл болино (цагаан
     * дэлгэцэнд гацахаас сэргийлж class-ыг заавал цэвэрлэнэ).
     */
    function startAutoUse() {
        stopAutoUse();
        root.classList.add('h5p-autouse');
        var deadline = Date.now() + 6000;

        autoUseTimer = setInterval(function () {
            if (Date.now() > deadline) {
                stopAutoUse();
                return;
            }
            var detail = document.querySelector('.h5p-hub-content-type-detail.h5p-hub-show');
            if (!detail) return;

            var bar = detail.querySelector('.h5p-hub-content-type-detail-button-bar') ||
                detail.querySelector('.h5p-hub-button-bar');
            if (!bar) return;

            var use = bar.querySelector('.h5p-hub-button-primary');
            if (use) {
                stopAutoUse.timerDone = true;
                clearInterval(autoUseTimer);
                autoUseTimer = null;
                use.click();
                /* Editor форм ачаалж эхэлмэгц class-ыг авна */
                setTimeout(function () { root.classList.remove('h5p-autouse'); }, 500);
                return;
            }

            /* Суулгаагүй төрөл: Install (inverse-primary, "Суулгах") товчийг нэг удаа дарна */
            var install = bar.querySelector('.h5p-hub-button-inverse-primary');
            if (install && !install.disabled && !install.dataset.h5pAutoClicked) {
                install.dataset.h5pAutoClicked = '1';
                deadline = Date.now() + 30000; /* суулгалт удаж болно */
                install.click();
            }
        }, 150);
    }

    function cardTitle(el) {
        var li = el && el.closest ? el.closest('.h5p-hub-media') : null;
        var heading = li && li.querySelector('.h5p-hub-media-heading');
        return heading ? heading.textContent.trim() : '';
    }

    /* Жагсаалтын сонгох товч дарагдмагц авто-Use горимд оруулна.
       Татах (install) товч → parent-ийн modal-д суулгах урсгал руу. */
    document.addEventListener('click', function (e) {
        var t = e.target;
        if (!t || !t.closest) return;
        if (t.closest('.h5p-hub-info-btn')) return;

        var install = t.closest('.h5p-hub-content-type-list .h5p-hub-button-install');
        if (install) {
            e.preventDefault();
            e.stopPropagation();
            try {
                window.parent.postMessage({ __h5pHubInfo: { title: cardTitle(install), install: true } }, '*');
            } catch (err) { /* ignore */ }
            return;
        }

        var btn = t.closest(
            '.h5p-hub-content-type-list .h5p-hub-button-primary,' +
            '.h5p-hub-content-type-list .h5p-hub-button-inverse-primary'
        );
        if (btn) {
            startAutoUse();
        }
    }, true);

    /* Parent-аас "энэ төрлийг шууд ашигла" команд (суулгалтын дараа) */
    window.addEventListener('message', function (e) {
        var d = e && e.data;
        if (!d || !d.__h5pHubUse) return;
        var title = String(d.__h5pHubUse.title || '').trim();
        var items = document.querySelectorAll('.h5p-hub-content-type-list .h5p-hub-media');
        for (var i = 0; i < items.length; i++) {
            if (cardTitle(items[i]) === title) {
                var sb = items[i].querySelector('.h5p-hub-button-primary, .h5p-hub-button-inverse-primary');
                if (sb) {
                    startAutoUse();
                    sb.click();
                }
                return;
            }
        }
    });

    /* Карт бүрт info товч нэмнэ */
    function injectInfoButtons() {
        var items = document.querySelectorAll('.h5p-hub-content-type-list .h5p-hub-media');
        for (var i = 0; i < items.length; i++) {
            var li = items[i];
            if (li.querySelector('.h5p-hub-info-btn')) continue;
            var selectBtn = li.querySelector('.h5p-hub-button-primary, .h5p-hub-button-inverse-primary');
            if (!selectBtn) continue;

            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'h5p-hub-info-btn';
            b.setAttribute('aria-label', 'Дэлгэрэнгүй');
            b.textContent = 'i';
            (function (item) {
                b.addEventListener('click', function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    stopAutoUse();
                    var heading = item.querySelector('.h5p-hub-media-heading');
                    var title = heading ? heading.textContent.trim() : '';
                    try {
                        /* Parent (builder editor.vue) iView Modal-д дэлгэрэнгүйг харуулна */
                        window.parent.postMessage({ __h5pHubInfo: { title: title } }, '*');
                    } catch (err) { /* parent байхгүй орчинд чимээгүй */ }
                });
            })(li);
            li.appendChild(b);
        }
    }

    /**
     * Нэмэлт тохиргоонуудыг collapse биш TAB болгож харуулна:
     * - .tree доторх ЭХНИЙХЭЭС БУСАД root түвшний group-үүд
     *   (жишээ нь "Харагдацын тохиргоо" = behaviour/override)
     * - .common (= "Текстийн тохиргоо ба орчуулга")
     * Үндсэн формын гүн доторх collapse-ууд хэвээр үлдэнэ. Форм аажмаар
     * бүтдэг тул mutation бүрт шинээр гарсан панелийг нэмж бүртгэнэ.
     */
    function buildExtraTabs() {
        var form = document.querySelector('.h5peditor-form');
        if (!form) return;
        var tree = form.querySelector('.tree');
        if (!tree) return;

        /* Зөвхөн ТОХИРГООНЫ группүүдийг tab болгоно (semantics-ийн нэрээр нь) —
           контентын үндсэн группүүд (жишээ нь Timeline-ийн үндсэн групп)
           үндсэн tab дотроо үлдэнэ */
        var SETTINGS_FIELDS = ['behaviour', 'override', 'l10n', 'look', 'visuals', 'display'];
        var candidates = [];
        var kids = Array.prototype.slice.call(tree.children);
        for (var i = 0; i < kids.length; i++) {
            if (!kids[i].classList.contains('field') || !kids[i].classList.contains('group')) continue;
            var isSettings = SETTINGS_FIELDS.some(function (n) {
                return kids[i].classList.contains('field-name-' + n);
            });
            if (isSettings) candidates.push(kids[i]);
        }
        var common = form.querySelector('.common');
        if (common && common.parentNode === form && !common.classList.contains('hidden')) {
            candidates.push(common);
        }

        var fresh = candidates.filter(function (p) { return !p.classList.contains('h5p-extra-panel'); });

        var bar = form.querySelector('.h5p-extra-tabs');

        function activate(panel, tab) {
            var tabs = bar.querySelectorAll('.h5p-extra-tab');
            var panels = form.querySelectorAll('.h5p-extra-panel');
            for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');
            for (var j = 0; j < panels.length; j++) panels[j].classList.remove('h5p-extra-panel-active');
            tab.classList.add('active');
            panel.classList.add('h5p-extra-panel-active');
        }

        function makeTab(name, panel) {
            var tab = document.createElement('button');
            tab.type = 'button';
            tab.className = 'h5p-extra-tab';
            tab.textContent = name;
            tab.addEventListener('click', function () { activate(panel, tab); });
            bar.appendChild(tab);
            panel.classList.add('h5p-extra-panel');
            return tab;
        }

        /* Эхний tab = үндсэн хэсэг (.tree), default идэвхтэй */
        if (!bar) {
            bar = document.createElement('div');
            bar.className = 'h5p-extra-tabs';
            form.insertBefore(bar, tree);
            var mainTab = makeTab('Үндсэн', tree);
            tree.classList.add('h5p-main-panel');
            activate(tree, mainTab);
        }

        if (!fresh.length) return;

        fresh.forEach(function (panel) {
            var titleEl = panel.querySelector('.title, .h5peditor-label');
            makeTab(titleEl ? titleEl.textContent.trim() : 'Тохиргоо', panel);
            /* Панелийг формын төгсгөлд байрлуулна (нэг л панель харагдана) */
            form.appendChild(panel);
        });
    }

    var mo = new MutationObserver(function () {
        injectInfoButtons();
        buildExtraTabs();
    });
    mo.observe(root, { childList: true, subtree: true });

    injectInfoButtons();
    buildExtraTabs();
})();
