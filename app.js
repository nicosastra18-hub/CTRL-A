const KEY = "ruang-inventaris-items-v2";
const SESSION = "ruang-inventaris-session-v2";
const THEME = "ruang-inventaris-theme-v2";

const rooms = [
    "Lab Komputer",
    "Ruang Kelas",
    "Perpustakaan",
    "Ruang Guru"
];

const conditions = [
    "Baik",
    "Rusak Ringan",
    "Rusak Berat"
];

const starter = [
    {
        id: "1",
        name: "Komputer Desktop",
        code: "LAB-001",
        room: "Lab Komputer",
        quantity: 24,
        condition: "Baik",
        updatedAt: "2026-08-28"
    },
    {
        id: "2",
        name: "Proyektor Epson",
        code: "KLS-014",
        room: "Ruang Kelas",
        quantity: 6,
        condition: "Baik",
        updatedAt: "2026-08-27"
    },
    {
        id: "3",
        name: "Rak Buku Besi",
        code: "PER-009",
        room: "Perpustakaan",
        quantity: 12,
        condition: "Rusak Ringan",
        updatedAt: "2026-08-24"
    },
    {
        id: "4",
        name: "Kursi Kerja",
        code: "GRU-003",
        room: "Ruang Guru",
        quantity: 18,
        condition: "Rusak Berat",
        updatedAt: "2026-08-20"
    }
];

const state = {
    loggedIn: localStorage.getItem(SESSION) === "admin",
    items: loadItems(),
    page: "overview",
    dark: localStorage.getItem(THEME) === "dark",
    modal: null,
    modalOpen: false,
    query: "",
    room: "Semua ruangan",
    condition: "Semua kondisi"
};

const app = document.getElementById("app");

/* =========================
   DATA
========================= */

function loadItems() {
    try {
        const data = JSON.parse(
            localStorage.getItem(KEY)
        );

        return Array.isArray(data)
            ? data
            : starter;
    } catch {
        return starter;
    }
}

function saveItems() {
    localStorage.setItem(
        KEY,
        JSON.stringify(state.items)
    );
}

function generateId() {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return crypto.randomUUID();
    }

    return Date.now().toString(36);
}

function escapeHTML(value) {
    return String(value ?? "").replace(
        /[&<>'"]/g,
        char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&#039;",
            '"': "&quot;"
        })[char]
    );
}

function formatDate(value) {
    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(new Date(value));
}

function getStats() {
    return {
        total: state.items.reduce(
            (total, item) =>
                total + Number(item.quantity || 0),
            0
        ),

        good: state.items
            .filter(item => item.condition === "Baik")
            .reduce(
                (total, item) =>
                    total + Number(item.quantity || 0),
                0
            ),

        light: state.items
            .filter(
                item =>
                    item.condition === "Rusak Ringan"
            )
            .reduce(
                (total, item) =>
                    total + Number(item.quantity || 0),
                0
            ),

        heavy: state.items
            .filter(
                item =>
                    item.condition === "Rusak Berat"
            )
            .reduce(
                (total, item) =>
                    total + Number(item.quantity || 0),
                0
            )
    };
}

function getFilteredItems() {
    const query =
        state.query.toLowerCase().trim();

    return state.items.filter(item => {

        const searchMatch =
            `${item.name} ${item.code}`
                .toLowerCase()
                .includes(query);

        const roomMatch =
            state.room === "Semua ruangan" ||
            item.room === state.room;

        const conditionMatch =
            state.condition === "Semua kondisi" ||
            item.condition === state.condition;

        return (
            searchMatch &&
            roomMatch &&
            conditionMatch
        );
    });
}

/* =========================
   COMPONENT
========================= */

function badge(condition) {

    let className = "good";

    if (condition === "Rusak Ringan") {
        className = "light";
    }

    if (condition === "Rusak Berat") {
        className = "heavy";
    }

    return `
        <span class="badge ${className}">
            ${escapeHTML(condition)}
        </span>
    `;
}

function options(items, selected, first) {

    return [
        `<option value="${escapeHTML(first)}">
            ${escapeHTML(first)}
        </option>`,

        ...items.map(item => `
            <option
                value="${escapeHTML(item)}"
                ${item === selected ? "selected" : ""}
            >
                ${escapeHTML(item)}
            </option>
        `)
    ].join("");
}

/* =========================
   SIDEBAR
========================= */

function navItem(page, icon, label) {

    return `
        <button
            class="${state.page === page ? "active" : ""}"
            data-nav="${page}"
        >
            <i class="fa-solid ${icon}"></i>
            <span>${label}</span>
        </button>
    `;
}

function sidebar() {

    return `
        <aside class="sidebar">

            <div class="sidebar-brand">

                <div class="sidebar-logo">
                    A
                </div>

                <div>
                    <strong>CTRL + A</strong>
                    <small>Sistem Inventaris</small>
                </div>

            </div>

            <p class="sidebar-title">
                Menu
            </p>

            <nav class="nav">

                ${navItem(
                    "overview",
                    "fa-house",
                    "Dashboard"
                )}

                ${navItem(
                    "inventory",
                    "fa-boxes-stacked",
                    "Inventaris"
                )}

                ${navItem(
                    "stats",
                    "fa-chart-column",
                    "Statistik"
                )}

            </nav>

            <button
                class="quick-add"
                data-add
            >
                <i class="fa-solid fa-plus"></i>
                Tambah Barang
            </button>

            <div class="sidebar-bottom">

                <nav class="nav">

                    <button data-theme>

                        <i class="fa-solid ${
                            state.dark
                                ? "fa-sun"
                                : "fa-moon"
                        }"></i>

                        <span>
                            ${
                                state.dark
                                    ? "Mode Terang"
                                    : "Mode Gelap"
                            }
                        </span>

                    </button>

                    <button data-logout>

                        <i class="fa-solid fa-right-from-bracket"></i>

                        <span>
                            Keluar
                        </span>

                    </button>

                </nav>

            </div>

        </aside>
    `;
}

/* =========================
   TOPBAR
========================= */

function topbar() {

    let title = "Dashboard";

    if (state.page === "inventory") {
        title = "Inventaris";
    }

    if (state.page === "stats") {
        title = "Statistik";
    }

    return `
        <header class="topbar">

            <div class="topbar-left">

                <button
                    class="menu"
                    data-menu
                    aria-label="Buka menu"
                >
                    <i class="fa-solid fa-bars"></i>
                </button>

                <div>
                    <p>SISTEM INVENTARIS RUANGAN</p>
                    <h1>${title}</h1>
                </div>

            </div>

            <div class="user">

                <div class="avatar">
                    A
                </div>

                <div class="user-info">

                    <strong>CTRL + A</strong>

                    <small>
                        Administrator
                    </small>

                </div>

            </div>

        </header>
    `;
}

/* =========================
   LAYOUT
========================= */

function layout(content) {

    return `
        <div class="app">

            ${sidebar()}

            <main class="main">

                ${topbar()}

                ${content}

            </main>

            <footer class="footer">
                CTRL + A
                · Sistem Inventaris Ruangan
                © 2026
            </footer>

        </div>
    `;
}

/* =========================
   DASHBOARD
========================= */

function overview() {

    const stats = getStats();

    const recent =
        state.items.slice(0, 5);

    return `
        <section class="hero">

            <h2>
                Kelola inventaris
                dengan mudah.
            </h2>

            <p>
                Catat dan pantau semua barang
                di setiap ruangan secara sederhana
                dan terorganisir.
            </p>

            <button
                class="btn"
                data-add
            >
                <i class="fa-solid fa-plus"></i>
                Tambah Barang
            </button>

        </section>

        <section class="stats">

            <article class="stat">

                <div class="stat-head">

                    <span>Total Barang</span>

                    <div class="stat-icon">
                        <i class="fa-solid fa-box"></i>
                    </div>

                </div>

                <strong>
                    ${stats.total}
                </strong>

                <small>
                    Total seluruh unit
                </small>

            </article>

            <article class="stat">

                <div class="stat-head">

                    <span>Kondisi Baik</span>

                    <div class="stat-icon">
                        <i class="fa-solid fa-circle-check"></i>
                    </div>

                </div>

                <strong>
                    ${stats.good}
                </strong>

                <small>
                    Unit siap digunakan
                </small>

            </article>

            <article class="stat">

                <div class="stat-head">

                    <span>Perlu Perhatian</span>

                    <div class="stat-icon">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                    </div>

                </div>

                <strong>
                    ${stats.light + stats.heavy}
                </strong>

                <small>
                    Rusak ringan dan berat
                </small>

            </article>

        </section>

        <section class="panel">

            <div class="panel-head">

                <h2>
                    Inventaris Terbaru
                </h2>

                <button
                    class="btn btn-secondary"
                    data-nav="inventory"
                >
                    Lihat Semua
                </button>

            </div>

            <div class="recent-list">

                ${
                    recent.length
                        ? recent.map(item => `
                            <div class="recent">

                                <span class="item-icon">
                                    <i class="fa-solid fa-box"></i>
                                </span>

                                <span>

                                    <b>
                                        ${escapeHTML(
                                            item.name
                                        )}
                                    </b>

                                    <small>
                                        ${escapeHTML(
                                            item.room
                                        )}
                                        ·
                                        ${formatDate(
                                            item.updatedAt
                                        )}
                                    </small>

                                </span>

                                ${badge(
                                    item.condition
                                )}

                            </div>
                        `).join("")
                        : `
                            <div class="empty">
                                Belum ada inventaris.
                            </div>
                        `
                }

            </div>

        </section>
    `;
}

/* =========================
   INVENTORY
========================= */

function inventory() {

    const list =
        getFilteredItems();

    return `
        <section>

            <div class="section-head">

                <div>
                    <h2>
                        Semua Inventaris
                    </h2>
                </div>

                <div class="header-actions">

                    <button
                        class="btn btn-secondary"
                        data-export
                    >
                        <i class="fa-solid fa-download"></i>
                        Backup
                    </button>

                    <label class="btn btn-secondary">

                        <i class="fa-solid fa-upload"></i>
                        Import

                        <input
                            type="file"
                            data-import
                            accept="application/json"
                            hidden
                        >

                    </label>

                    <button
                        class="btn btn-primary"
                        data-add
                    >
                        <i class="fa-solid fa-plus"></i>
                        Tambah
                    </button>

                </div>

            </div>

            <div class="toolbar">

                <div class="search">

                    <i class="fa-solid fa-search"></i>

                    <input
                        data-query
                        value="${escapeHTML(
                            state.query
                        )}"
                        placeholder="Cari nama atau kode..."
                    >

                </div>

                <select data-room>
                    ${options(
                        rooms,
                        state.room,
                        "Semua ruangan"
                    )}
                </select>

                <select data-condition>
                    ${options(
                        conditions,
                        state.condition,
                        "Semua kondisi"
                    )}
                </select>

            </div>

            <div class="panel table-wrap">

                <table class="table">

                    <thead>
                        <tr>
                            <th>Barang</th>
                            <th>Kode</th>
                            <th>Ruangan</th>
                            <th>Jumlah</th>
                            <th>Kondisi</th>
                            <th>Diperbarui</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>

                    <tbody>

                        ${
                            list.length
                                ? list.map(item => {

                                    const image =
                                        item.images?.[0] ||
                                        item.image;

                                    return `
                                        <tr
                                            data-row="${escapeHTML(
                                                item.id
                                            )}"
                                        >

                                            <td>

                                                <div class="item-name">

                                                    ${
                                                        image
                                                            ? `
                                                                <img
                                                                    class="thumb"
                                                                    src="${image}"
                                                                    alt=""
                                                                >
                                                            `
                                                            : `
                                                                <span class="item-icon">
                                                                    <i class="fa-solid fa-box"></i>
                                                                </span>
                                                            `
                                                    }

                                                    <b>
                                                        ${escapeHTML(
                                                            item.name
                                                        )}
                                                    </b>

                                                </div>

                                            </td>

                                            <td>
                                                <code>
                                                    ${escapeHTML(
                                                        item.code
                                                    )}
                                                </code>
                                            </td>

                                            <td>
                                                ${escapeHTML(
                                                    item.room
                                                )}
                                            </td>

                                            <td>
                                                <b>
                                                    ${Number(
                                                        item.quantity
                                                    )}
                                                </b>
                                                unit
                                            </td>

                                            <td>
                                                ${badge(
                                                    item.condition
                                                )}
                                            </td>

                                            <td>
                                                ${formatDate(
                                                    item.updatedAt
                                                )}
                                            </td>

                                            <td>

                                                <div class="actions">

                                                    <button
                                                        data-edit="${escapeHTML(
                                                            item.id
                                                        )}"
                                                        title="Edit"
                                                    >
                                                        <i class="fa-solid fa-pen"></i>
                                                    </button>

                                                    <button
                                                        class="danger"
                                                        data-delete="${escapeHTML(
                                                            item.id
                                                        )}"
                                                        title="Hapus"
                                                    >
                                                        <i class="fa-solid fa-trash"></i>
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>
                                    `;

                                }).join("")
                                : `
                                    <tr>

                                        <td colspan="7">

                                            <div class="empty">
                                                Tidak ada data ditemukan.
                                            </div>

                                        </td>

                                    </tr>
                                `
                        }

                    </tbody>

                </table>

            </div>

        </section>
    `;
}

/* =========================
   STATISTICS
========================= */

function statsPage() {

    const stats =
        getStats();

    return `
        <section>

            <div class="section-head">

                <div>
                    <h2>
                        Statistik Inventaris
                    </h2>
                </div>

            </div>

            <section class="stats">

                <article class="stat">

                    <div class="stat-head">

                        <span>Baik</span>

                        <div class="stat-icon">
                            <i class="fa-solid fa-check"></i>
                        </div>

                    </div>

                    <strong>
                        ${stats.good}
                    </strong>

                    <small>
                        Unit
                    </small>

                </article>

                <article class="stat">

                    <div class="stat-head">

                        <span>Rusak Ringan</span>

                        <div class="stat-icon">
                            <i class="fa-solid fa-wrench"></i>
                        </div>

                    </div>

                    <strong>
                        ${stats.light}
                    </strong>

                    <small>
                        Unit
                    </small>

                </article>

                <article class="stat">

                    <div class="stat-head">

                        <span>Rusak Berat</span>

                        <div class="stat-icon">
                            <i class="fa-solid fa-triangle-exclamation"></i>
                        </div>

                    </div>

                    <strong>
                        ${stats.heavy}
                    </strong>

                    <small>
                        Unit
                    </small>

                </article>

            </section>

            <div class="panel">

                <div class="panel-head">

                    <h2>
                        Kondisi Barang
                    </h2>

                </div>

                ${conditions.map(condition => {

                    let value =
                        stats.good;

                    if (
                        condition ===
                        "Rusak Ringan"
                    ) {
                        value =
                            stats.light;
                    }

                    if (
                        condition ===
                        "Rusak Berat"
                    ) {
                        value =
                            stats.heavy;
                    }

                    const percentage =
                        stats.total
                            ? Math.round(
                                value /
                                stats.total *
                                100
                            )
                            : 0;

                    const barClass =
                        condition === "Baik"
                            ? "bar-good"
                            : condition === "Rusak Ringan"
                                ? "bar-light"
                                : "bar-heavy";

                    return `
                        <div class="bar-row">

                            <div class="bar-label">

                                <span>
                                    ${condition}
                                </span>

                                <b>
                                    ${value}
                                    unit
                                    (${percentage}%)
                                </b>

                            </div>

                            <div class="bar">

                                <span
                                    class="${barClass}"
                                    style="width:${percentage}%"
                                ></span>

                            </div>

                        </div>
                    `;

                }).join("")}

            </div>

        </section>
    `;
}

/* =========================
   MODAL
========================= */

function modal() {

    const item =
        state.modal;

    const images =
        item?.images ||
        (item?.image
            ? [item.image]
            : []);

    return `
        <div
            class="modal-backdrop"
            data-close-modal
        >

            <section
                class="modal"
                onclick="event.stopPropagation()"
            >

                <div class="modal-head">

                    <h2>
                        ${
                            item
                                ? "Edit Inventaris"
                                : "Tambah Barang"
                        }
                    </h2>

                    <button
                        type="button"
                        class="close"
                        data-close-modal
                    >
                        <i class="fa-solid fa-xmark"></i>
                    </button>

                </div>

                <form
                    class="modal-form"
                    id="item-form"
                >

                    <div class="field">

                        <label>
                            Nama Barang
                        </label>

                        <input
                            name="name"
                            required
                            value="${escapeHTML(
                                item?.name || ""
                            )}"
                            placeholder="Contoh: Laptop Lenovo"
                        >

                    </div>

                    <div class="grid-2">

                        <div class="field">

                            <label>
                                Kode Inventaris
                            </label>

                            <input
                                name="code"
                                required
                                value="${escapeHTML(
                                    item?.code || ""
                                )}"
                                placeholder="LAB-001"
                            >

                        </div>

                        <div class="field">

                            <label>
                                Jumlah
                            </label>

                            <input
                                name="quantity"
                                type="number"
                                min="1"
                                required
                                value="${
                                    item?.quantity || 1
                                }"
                            >

                        </div>

                    </div>

                    <div class="field">

                        <label>
                            Ruangan
                        </label>

                        <select name="room">

                            ${options(
                                rooms,
                                item?.room ||
                                    rooms[0],
                                rooms[0]
                            )}

                        </select>

                    </div>

                    <div class="field">

                        <label>
                            Kondisi
                        </label>

                        <select name="condition">

                            ${options(
                                conditions,
                                item?.condition ||
                                    "Baik",
                                "Pilih kondisi"
                            )}

                        </select>

                    </div>

                    <div class="field">

                        <label>
                            Foto Barang
                        </label>

                        <input
                            name="images"
                            type="file"
                            accept="image/*"
                            multiple
                        >

                    </div>

                    ${
                        images.length
                            ? `
                                <div class="preview-grid">

                                    ${images.map(
                                        image => `
                                            <img
                                                src="${image}"
                                                alt="Foto barang"
                                            >
                                        `
                                    ).join("")}

                                </div>
                            `
                            : ""
                    }

                    <div class="modal-actions">

                        <button
                            type="button"
                            class="btn btn-secondary"
                            data-close-modal
                        >
                            Batal
                        </button>

                        <button
                            type="submit"
                            class="btn btn-primary"
                        >
                            <i class="fa-solid fa-check"></i>

                            ${
                                item
                                    ? "Simpan Perubahan"
                                    : "Simpan Barang"
                            }

                        </button>

                    </div>

                </form>

            </section>

        </div>
    `;
}

/* =========================
   LOGIN
========================= */

function login() {

    return `
        <main class="login-page">

            <div class="login-card">

                <div class="login-brand">

                    <div class="logo">
                        A
                    </div>

                    <h1>
                        CTRL + A
                    </h1>

                    <p>
                        Sistem pengelolaan inventaris ruangan
                    </p>

                </div>

                <form
                    class="form"
                    id="login-form"
                >

                    <div class="field">

                        <label>
                            Username
                        </label>

                        <input
                            name="username"
                            required
                            placeholder="admin"
                            autocomplete="username"
                        >

                    </div>

                    <div class="field">

                        <label>
                            Kata Sandi
                        </label>

                        <input
                            name="password"
                            type="password"
                            required
                            placeholder="Masukkan kata sandi"
                            autocomplete="current-password"
                        >

                    </div>

                    <button
                        class="btn btn-primary"
                        type="submit"
                    >
                        Masuk
                        <i class="fa-solid fa-arrow-right"></i>
                    </button>

                </form>

                <div class="demo">

                    Demo:
                    <code>admin</code>
                    /
                    <code>inventaris123</code>

                </div>

            </div>

        </main>
    `;
}

/* =========================
   RENDER
========================= */

function render() {

    document.body.classList.toggle(
        "dark",
        state.dark
    );

    let content = "";

    if (state.page === "overview") {
        content = overview();
    }

    if (state.page === "inventory") {
        content = inventory();
    }

    if (state.page === "stats") {
        content = statsPage();
    }

    app.innerHTML =
        state.loggedIn
            ? layout(content)
            : login();

    /*
     * PENTING:
     * Modal lama dihapus sebelum membuat modal baru.
     * Ini mencegah form tambah barang menumpuk.
     */
    document
        .querySelectorAll(".modal-backdrop")
        .forEach(element => element.remove());

    if (
        state.loggedIn &&
        state.modalOpen
    ) {
        document.body.insertAdjacentHTML(
            "beforeend",
            modal()
        );
    }

    bind();
}

/* =========================
   TOAST
========================= */

function toast(
    message,
    type = "success"
) {

    document
        .querySelectorAll(".toast")
        .forEach(element =>
            element.remove()
        );

    const element =
        document.createElement("div");

    element.className =
        `toast ${type}`;

    element.innerHTML = `
        <i class="fa-solid ${
            type === "error"
                ? "fa-circle-exclamation"
                : "fa-circle-check"
        }"></i>

        <span>
            ${escapeHTML(message)}
        </span>
    `;

    document.body.appendChild(
        element
    );

    setTimeout(() => {
        element.remove();
    }, 2500);
}

/* =========================
   MODAL CONTROL
========================= */

function openModal(item = null) {

    state.modal =
        item
            ? { ...item }
            : null;

    state.modalOpen = true;

    render();

    setTimeout(() => {
        document
            .querySelector(
                '#item-form input[name="name"]'
            )
            ?.focus();
    }, 0);
}

function closeModal() {

    state.modal = null;

    state.modalOpen = false;

    document
        .querySelectorAll(".modal-backdrop")
        .forEach(element =>
            element.remove()
        );

    render();
}

/* =========================
   FILE
========================= */

function fileData(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();

            reader.onload = () =>
                resolve(
                    String(reader.result)
                );

            reader.onerror =
                reject;

            reader.readAsDataURL(file);
        }
    );
}

/* =========================
   BIND EVENTS
========================= */

function bind() {

    /* Navigation */

    document
        .querySelectorAll("[data-nav]")
        .forEach(button => {

            button.onclick = () => {

                state.page =
                    button.dataset.nav;

                state.modal = null;
                state.modalOpen = false;

                document.body.classList.remove(
                    "menu-open"
                );

                render();
            };
        });

    /* Add */

    document
        .querySelectorAll("[data-add]")
        .forEach(button => {

            button.onclick = event => {

                event.preventDefault();

                openModal();
            };
        });

    /* Menu */

    document
        .querySelector("[data-menu]")
        ?.addEventListener(
            "click",
            () => {

                document.body.classList.toggle(
                    "menu-open"
                );
            }
        );

    /* Theme */

    document
        .querySelector("[data-theme]")
        ?.addEventListener(
            "click",
            () => {

                state.dark =
                    !state.dark;

                localStorage.setItem(
                    THEME,
                    state.dark
                        ? "dark"
                        : "light"
                );

                render();
            }
        );

    /* Logout */

    document
        .querySelector("[data-logout]")
        ?.addEventListener(
            "click",
            () => {

                state.loggedIn = false;

                state.modal = null;
                state.modalOpen = false;

                localStorage.removeItem(
                    SESSION
                );

                render();

                toast(
                    "Anda berhasil keluar."
                );
            }
        );

    /* Search */

    document
        .querySelector("[data-query]")
        ?.addEventListener(
            "input",
            event => {

                state.query =
                    event.target.value;

                const cursor =
                    event.target.selectionStart;

                render();

                const input =
                    document.querySelector(
                        "[data-query]"
                    );

                if (input) {

                    input.focus();

                    input.setSelectionRange(
                        cursor,
                        cursor
                    );
                }
            }
        );

    /* Room */

    document
        .querySelector("[data-room]")
        ?.addEventListener(
            "change",
            event => {

                state.room =
                    event.target.value;

                render();
            }
        );

    /* Condition */

    document
        .querySelector("[data-condition]")
        ?.addEventListener(
            "change",
            event => {

                state.condition =
                    event.target.value;

                render();
            }
        );

    /* Export */

    document
        .querySelector("[data-export]")
        ?.addEventListener(
            "click",
            () => {

                const blob =
                    new Blob(
                        [
                            JSON.stringify(
                                state.items,
                                null,
                                2
                            )
                        ],
                        {
                            type:
                                "application/json"
                        }
                    );

                const url =
                    URL.createObjectURL(
                        blob
                    );

                const link =
                    document.createElement(
                        "a"
                    );

                link.href = url;

                link.download =
                    `backup-inventaris-${new Date()
                        .toISOString()
                        .slice(0, 10)}.json`;

                document.body.appendChild(
                    link
                );

                link.click();

                link.remove();

                URL.revokeObjectURL(
                    url
                );

                toast(
                    "Backup berhasil dibuat."
                );
            }
        );

    /* Import */

    document
        .querySelector("[data-import]")
        ?.addEventListener(
            "change",
            event => {

                const file =
                    event.target.files?.[0];

                if (!file) return;

                const reader =
                    new FileReader();

                reader.onload = () => {

                    try {

                        const data =
                            JSON.parse(
                                String(
                                    reader.result
                                )
                            );

                        if (
                            !Array.isArray(
                                data
                            )
                        ) {
                            throw new Error();
                        }

                        state.items =
                            data
                                .filter(
                                    item =>
                                        item &&
                                        item.name &&
                                        item.code
                                )
                                .map(
                                    item => ({
                                        ...item,

                                        id:
                                            item.id ||
                                            generateId(),

                                        quantity:
                                            Math.max(
                                                1,
                                                Number(
                                                    item.quantity
                                                ) || 1
                                            ),

                                        updatedAt:
                                            item.updatedAt ||
                                            new Date()
                                                .toISOString()
                                    })
                                );

                        saveItems();

                        render();

                        toast(
                            "Backup berhasil dipulihkan."
                        );

                    } catch {

                        toast(
                            "File backup tidak valid.",
                            "error"
                        );
                    }
                };

                reader.readAsText(file);

                event.target.value = "";
            }
        );

    /* Edit */

    document
        .querySelectorAll("[data-edit]")
        .forEach(button => {

            button.onclick = () => {

                const item =
                    state.items.find(
                        item =>
                            item.id ===
                            button.dataset.edit
                    );

                if (item) {
                    openModal(item);
                }
            };
        });

    /* Delete */

    document
        .querySelectorAll("[data-delete]")
        .forEach(button => {

            button.onclick = () => {

                const confirmed =
                    confirm(
                        "Hapus data inventaris ini?"
                    );

                if (!confirmed) return;

                state.items =
                    state.items.filter(
                        item =>
                            item.id !==
                            button.dataset.delete
                    );

                saveItems();

                render();

                toast(
                    "Data berhasil dihapus."
                );
            };
        });

    /* Close modal */

    document
        .querySelectorAll(
            "[data-close-modal]"
        )
        .forEach(button => {

            button.onclick =
                event => {

                    event.preventDefault();

                    closeModal();
                };
        });

    /* Close modal outside */

    document
        .querySelector(
            ".modal-backdrop"
        )
        ?.addEventListener(
            "click",
            event => {

                if (
                    event.target.classList
                        .contains(
                            "modal-backdrop"
                        )
                ) {
                    closeModal();
                }
            }
        );

    /* Login */

    document
        .querySelector("#login-form")
        ?.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const form =
                    new FormData(
                        event.target
                    );

                const username =
                    String(
                        form.get("username")
                    ).trim();

                const password =
                    String(
                        form.get("password")
                    );

                if (
                    (
                        username === "admin" ||
                        username ===
                            "admin@ruang.id"
                    ) &&
                    password ===
                        "inventaris123"
                ) {

                    state.loggedIn = true;

                    state.page =
                        "overview";

                    localStorage.setItem(
                        SESSION,
                        "admin"
                    );

                    render();

                    toast(
                        "Login berhasil."
                    );

                } else {

                    toast(
                        "Username atau kata sandi salah.",
                        "error"
                    );
                }
            }
        );

    /* =========================
       SAVE ITEM
    ========================= */

    document
        .querySelector("#item-form")
        ?.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                const submitButton =
                    event.submitter;

                if (submitButton) {
                    submitButton.disabled =
                        true;
                }

                const form =
                    new FormData(
                        event.target
                    );

                const old =
                    state.modal?.id
                        ? state.modal
                        : null;

                let images =
                    old?.images ||
                    (
                        old?.image
                            ? [old.image]
                            : []
                    );

                const files =
                    [
                        ...form.getAll(
                            "images"
                        )
                    ].filter(
                        file =>
                            file instanceof File &&
                            file.size > 0
                    );

                /*
                 * Maksimal total 4 foto.
                 */

                if (
                    images.length +
                    files.length > 4
                ) {

                    toast(
                        "Maksimal 4 foto.",
                        "error"
                    );

                    if (submitButton) {
                        submitButton.disabled =
                            false;
                    }

                    return;
                }

                /*
                 * Maksimal ukuran 1 MB.
                 */

                if (
                    files.some(
                        file =>
                            file.size >
                            1000000
                    )
                ) {

                    toast(
                        "Ukuran foto maksimal 1 MB.",
                        "error"
                    );

                    if (submitButton) {
                        submitButton.disabled =
                            false;
                    }

                    return;
                }

                try {

                    if (files.length) {

                        const newImages =
                            await Promise.all(
                                files.map(
                                    fileData
                                )
                            );

                        images = [
                            ...images,
                            ...newImages
                        ].slice(-4);
                    }

                    const name =
                        String(
                            form.get("name")
                        ).trim();

                    const code =
                        String(
                            form.get("code")
                        )
                        .trim()
                        .toUpperCase();

                    const room =
                        String(
                            form.get("room")
                        );

                    const condition =
                        String(
                            form.get("condition")
                        );

                    const quantity =
                        Math.max(
                            1,
                            Number(
                                form.get(
                                    "quantity"
                                )
                            ) || 1
                        );

                    if (
                        !name ||
                        !code ||
                        !room ||
                        !condition
                    ) {

                        toast(
                            "Lengkapi semua data.",
                            "error"
                        );

                        if (submitButton) {
                            submitButton.disabled =
                                false;
                        }

                        return;
                    }

                    const newItem = {

                        id:
                            old?.id ||
                            generateId(),

                        name,

                        code,

                        room,

                        quantity,

                        condition,

                        updatedAt:
                            new Date()
                                .toISOString(),

                        ...(images.length
                            ? { images }
                            : {})
                    };

                    if (old) {

                        state.items =
                            state.items.map(
                                current =>
                                    current.id ===
                                    old.id
                                        ? newItem
                                        : current
                            );

                    } else {

                        state.items = [
                            newItem,
                            ...state.items
                        ];
                    }

                    saveItems();

                    /*
                     * INI BAGIAN PENTING.
                     *
                     * Setelah berhasil simpan:
                     * 1. Modal ditutup.
                     * 2. Halaman diarahkan ke Inventaris.
                     * 3. Render ulang.
                     */

                    state.modal = null;

                    state.modalOpen = false;

                    state.page = "inventory";

                    render();

                    toast(
                        old
                            ? "Data berhasil diperbarui."
                            : "Barang berhasil ditambahkan."
                    );

                } catch (error) {

                    console.error(
                        "Gagal menyimpan:",
                        error
                    );

                    toast(
                        "Terjadi kesalahan saat menyimpan data.",
                        "error"
                    );

                    if (submitButton) {
                        submitButton.disabled =
                            false;
                    }
                }
            }
        );
}

/* =========================
   START
========================= */

render();