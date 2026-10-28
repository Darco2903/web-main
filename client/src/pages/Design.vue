<script setup lang="ts">
import { ref } from "vue";
import { useThemeStore, type Theme } from "@store/theme";

import CdnIcon from "@assets/icon-cdn.svg";
// as an <img>: inline, its gradient id would clash with the one in icon-cdn.svg
import mainIconUrl from "@assets/icon-main.svg?url";
import ManagerIcon from "@assets/icon-manager.svg";
import avatarUrl from "@icons/profile/user-default-dark.jpg";

const themeStore = useThemeStore();
const themes: Theme[] = ["system", "light", "dark"];

const checked = ref(true);
const radio = ref("a");
const switchOn = ref(true);
const roundBorder = ref(false);
const dragOver = ref(false);
const showDialog = ref(false);

const colors = ["primary", "secondary", "success", "warning", "error", "info"];
const tones = ["primary", "success", "warning", "error", "info"];
const radii = ["sm", "md", "lg", "xl", "pill"];
</script>

<template>
  <div class="ds g-backdrop">
    <div class="ds-page">
      <!-- Navbar -->
      <header class="g-navbar g-glass">
        <div class="flex row align-center" style="gap: 24px">
          <a class="ds-logo" href="/"><img :src="mainIconUrl" alt="Home" /></a>
          <nav class="flex row" style="gap: 4px">
            <a class="g-btn g-btn-ghost g-btn-sm">Home</a>
            <a class="g-btn g-btn-ghost g-btn-sm">CDN</a>
            <a class="g-btn g-btn-ghost g-btn-sm">Manager</a>
          </nav>
        </div>

        <div class="flex row align-center" style="gap: 16px">
          <div class="g-segmented" role="group" aria-label="Theme">
            <button
              v-for="th in themes"
              :key="th"
              :aria-pressed="themeStore.theme === th"
              @click="themeStore.setTheme(th)"
            >
              {{ th }}
            </button>
          </div>
          <a class="g-btn g-btn-brand g-btn-sm">Login</a>
          <!-- follows the avatar shape: pill for a round avatar, rounded square otherwise -->
          <div class="ds-session g-glass-subtle" :class="{ round: roundBorder }">
            <span class="g-avatar" :class="{ round: roundBorder }" style="--size: 36px">
              <img :src="avatarUrl" alt="" />
            </span>
            <span style="font-weight: 600; font-size: 14px">Darco</span>
          </div>
        </div>
      </header>

      <h1 class="ds-title">Glass design template</h1>
      <p class="g-text-muted" style="margin-top: -12px">
        Every element of the rework, in the current theme. Switch theme in the navbar.
      </p>

      <!-- Surfaces -->
      <section class="g-glass g-card">
        <h2>Backgrounds &amp; surfaces</h2>
        <div class="ds-grid">
          <div class="ds-surface g-glass-subtle">
            <b>.g-glass-subtle</b>
            <span class="g-text-muted">Nested blocks, chips</span>
          </div>
          <div class="ds-surface g-glass">
            <b>.g-glass</b>
            <span class="g-text-muted">Cards, navbar, panels</span>
          </div>
          <div class="ds-surface g-glass-strong">
            <b>.g-glass-strong</b>
            <span class="g-text-muted">Dialogs, menus, toasts</span>
          </div>
          <div class="ds-surface" style="background: var(--g-surface-solid); border-radius: var(--g-radius-lg)">
            <b>--g-surface-solid</b>
            <span class="g-text-muted">Fallback without blur</span>
          </div>
        </div>
        <p class="g-text-muted" style="margin-bottom: 0">
          Page background: <code class="g-code">.g-backdrop</code> (base color + four brand-colored blobs, fixed)
        </p>
      </section>

      <!-- Typography & colors -->
      <div class="ds-cols">
        <section class="g-glass g-card">
          <h2>Typography</h2>
          <div class="flex col" style="gap: 10px">
            <span style="font-size: 32px; font-weight: 700">Heading 1</span>
            <span style="font-size: 24px; font-weight: 700">Heading 2</span>
            <span style="font-size: 18px; font-weight: 600">Heading 3</span>
            <span>Body text, regular weight, used everywhere.</span>
            <span class="g-text-muted">Muted text for descriptions and labels.</span>
            <span class="g-text-subtle" style="font-size: 13px">Subtle text for hints and metadata.</span>
            <span>
              A <a class="g-link" href="#">text link</a>, some <code class="g-code">inline code</code> and a
              <span class="g-text-gradient" style="font-weight: 700">gradient accent</span>.
            </span>
          </div>
        </section>

        <section class="g-glass g-card">
          <h2>Colors</h2>
          <div class="ds-swatches">
            <div v-for="c in colors" :key="c" class="ds-swatch">
              <span :style="{ background: `var(--color-${c})` }"></span>
              <small>{{ c }}</small>
            </div>
            <div class="ds-swatch">
              <span style="background: var(--g-gradient-primary)"></span>
              <small>gradient primary</small>
            </div>
            <div class="ds-swatch">
              <span style="background: var(--g-gradient-brand)"></span>
              <small>gradient brand</small>
            </div>
          </div>
        </section>
      </div>

      <!-- Borders, radius, shadows -->
      <section class="g-glass g-card">
        <h2>Borders, radius &amp; shadows</h2>
        <h3>Radius</h3>
        <div class="ds-row">
          <div
            v-for="r in radii"
            :key="r"
            class="ds-box g-glass-subtle"
            :style="{ borderRadius: `var(--g-radius-${r})` }"
          >
            {{ r }}
          </div>
        </div>
        <h3>Borders</h3>
        <div class="ds-row">
          <div class="ds-box" style="border: 1px solid var(--g-border-subtle)">subtle</div>
          <div class="ds-box" style="border: 1px solid var(--g-border)">glass edge</div>
          <div class="ds-box" style="border: 1px solid var(--g-border-strong)">strong</div>
          <div class="ds-box" style="border: 2px dashed var(--g-border-strong)">dashed</div>
          <div class="ds-box" style="border: 1px solid var(--color-primary); box-shadow: var(--g-ring)">focus ring</div>
        </div>
        <h3>Shadows</h3>
        <div class="ds-row">
          <div class="ds-box g-glass-subtle" style="box-shadow: var(--g-shadow-sm)">sm</div>
          <div class="ds-box g-glass-subtle" style="box-shadow: var(--g-shadow)">md</div>
          <div class="ds-box g-glass-subtle" style="box-shadow: var(--g-shadow-lg)">lg</div>
        </div>
      </section>

      <!-- Buttons -->
      <section class="g-glass g-card">
        <h2>Buttons</h2>
        <h3>Variants</h3>
        <div class="ds-row">
          <button class="g-btn">Default</button>
          <button class="g-btn g-btn-primary">Primary</button>
          <button class="g-btn g-btn-brand">Brand</button>
          <button class="g-btn g-btn-danger">Danger</button>
          <button class="g-btn g-btn-ghost">Ghost</button>
          <a class="g-btn" href="#">Link as button</a>
        </div>
        <h3>Sizes &amp; shapes</h3>
        <div class="ds-row">
          <button class="g-btn g-btn-primary g-btn-sm">Small</button>
          <button class="g-btn g-btn-primary">Medium</button>
          <button class="g-btn g-btn-primary g-btn-lg">Large</button>
          <button class="g-btn g-btn-pill">Pill</button>
          <button class="g-btn g-btn-icon" aria-label="Back">←</button>
          <button class="g-btn g-btn-icon g-btn-sm" aria-label="Close">✕</button>
        </div>
        <h3>States</h3>
        <div class="ds-row">
          <button class="g-btn" disabled>Disabled</button>
          <button class="g-btn g-btn-primary" disabled>Disabled</button>
          <button class="g-btn g-btn-primary"><span class="g-spinner g-spinner-sm"></span>Saving…</button>
          <button class="g-btn"><span class="g-spinner g-spinner-sm"></span>Loading</button>
        </div>
        <p class="g-text-subtle" style="font-size: 13px; margin-bottom: 0">
          Hover, press and Tab onto a button to see the hover, active and focus states.
        </p>
      </section>

      <!-- Fields -->
      <div class="ds-cols">
        <section class="g-glass g-card">
          <h2>Inputs</h2>
          <div class="flex col" style="gap: 16px">
            <div>
              <label class="g-label" for="ds-username">Username</label>
              <input id="ds-username" class="g-input ds-full" placeholder="Your username" />
              <div class="g-hint">Visible on your public profile.</div>
            </div>
            <div>
              <label class="g-label" for="ds-invalid">Invalid</label>
              <input id="ds-invalid" class="g-input ds-full" value="a" aria-invalid="true" />
              <div class="g-hint g-error">Username must be at least 3 characters.</div>
            </div>
            <div>
              <label class="g-label" for="ds-disabled">Disabled</label>
              <input id="ds-disabled" class="g-input ds-full" value="Read only" disabled />
            </div>
            <div>
              <label class="g-label" for="ds-select">Select</label>
              <select id="ds-select" class="g-select ds-full">
                <option>English</option>
                <option>Français</option>
              </select>
            </div>
            <div>
              <label class="g-label" for="ds-textarea">Textarea</label>
              <textarea id="ds-textarea" class="g-textarea ds-full" placeholder="Write something…"></textarea>
            </div>
          </div>
        </section>

        <section class="g-glass g-card">
          <h2>Controls</h2>
          <div class="flex col" style="gap: 16px">
            <label class="g-field-row"><input type="checkbox" class="g-check" v-model="checked" /> Checkbox</label>
            <label class="g-field-row"><input type="checkbox" class="g-check" disabled /> Disabled checkbox</label>
            <div class="flex row" style="gap: 20px">
              <label class="g-field-row">
                <input type="radio" class="g-radio" value="a" v-model="radio" /> Option A
              </label>
              <label class="g-field-row">
                <input type="radio" class="g-radio" value="b" v-model="radio" /> Option B
              </label>
            </div>
            <label class="g-field-row"><input type="checkbox" class="g-switch" v-model="switchOn" /> Switch</label>
            <label class="g-field-row">
              <input type="checkbox" class="g-shape-toggle" v-model="roundBorder" /> Round border (avatar option)
            </label>
            <div>
              <div class="g-label">Segmented</div>
              <div class="g-segmented" role="group">
                <button :aria-pressed="radio === 'a'" @click="radio = 'a'">Profile</button>
                <button :aria-pressed="radio === 'b'" @click="radio = 'b'">Security</button>
              </div>
            </div>
            <div>
              <div class="g-label">Dropzone</div>
              <div
                class="g-dropzone"
                :data-over="dragOver"
                @dragover.prevent="dragOver = true"
                @dragleave.prevent="dragOver = false"
                @drop.prevent="dragOver = false"
              >
                <span>Drag &amp; drop an image</span>
                <button class="g-btn g-btn-sm">Upload</button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Feedback -->
      <section class="g-glass g-card">
        <h2>Feedback</h2>
        <h3>Badges</h3>
        <div class="ds-row">
          <span class="g-badge">Neutral</span>
          <span v-for="tone in tones" :key="tone" class="g-badge" :class="`g-${tone}`">{{ tone }}</span>
        </div>
        <h3>Alerts</h3>
        <div class="flex col" style="gap: 10px">
          <div class="g-alert g-warning">Your email is not verified. <a class="g-link" href="#">Verify now</a></div>
          <div class="g-alert g-error">Failed to update username.</div>
          <div class="g-alert g-success">Profile picture updated.</div>
          <div class="g-alert g-info">Changes are saved on the auth server.</div>
        </div>
        <h3>Toasts</h3>
        <div class="flex col" style="gap: 8px; align-items: flex-start">
          <div class="g-toast g-success">
            <span style="flex: 1">Username updated</span>
            <button class="g-btn g-btn-ghost g-btn-icon g-btn-sm" aria-label="Close">✕</button>
          </div>
          <div class="g-toast g-error">
            <span style="flex: 1">Unable to get assets token</span>
            <button class="g-btn g-btn-ghost g-btn-icon g-btn-sm" aria-label="Close">✕</button>
          </div>
        </div>
        <h3>Loading</h3>
        <div class="ds-row">
          <span class="g-spinner"></span>
          <span class="g-spinner g-spinner-sm"></span>
          <div class="g-glass-strong ds-loading"><span class="g-spinner"></span></div>
        </div>
      </section>

      <!-- Dialog -->
      <section class="g-glass g-card">
        <h2>Dialog</h2>
        <div class="ds-dialog-stage">
          <div class="g-dialog g-glass-strong" role="dialog">
            <div>
              <div style="font-weight: 600">Delete your profile picture?</div>
              <div class="g-text-muted" style="margin-top: 8px; font-size: 14px">This cannot be undone.</div>
            </div>
            <div class="g-dialog-actions">
              <button class="g-btn g-btn-danger">Confirm</button>
              <button class="g-btn">Cancel</button>
            </div>
          </div>
          <div class="g-dialog g-glass-strong" role="dialog">
            <div style="font-weight: 600">You need to be logged in to access this page</div>
            <div class="g-dialog-actions">
              <button class="g-btn g-btn-primary">OK</button>
            </div>
          </div>
        </div>
        <button class="g-btn" style="margin-top: 16px" @click="showDialog = true">Open with scrim</button>
      </section>

      <!-- Cards -->
      <section class="g-glass g-card">
        <h2>Cards</h2>
        <div class="ds-row" style="gap: 24px">
          <a class="ds-tile g-glass g-card g-card-hover">
            <CdnIcon class="ds-tile-icon" />
            <span>CDN</span>
          </a>
          <a class="ds-tile g-glass g-card g-card-hover">
            <ManagerIcon class="ds-tile-icon" />
            <span>Server Manager</span>
          </a>

          <div class="ds-profile g-glass g-card">
            <span class="g-avatar" :class="{ round: roundBorder }" style="--size: 96px">
              <img :src="avatarUrl" alt="" />
            </span>
            <div class="flex col" style="gap: 8px">
              <div class="flex row align-center" style="gap: 8px">
                <span style="font-size: 22px; font-weight: 700">Darco</span>
                <span class="g-badge g-success">verified</span>
              </div>
              <span class="g-text-muted" style="font-size: 14px">Member since 2023</span>
              <div class="flex row" style="gap: 8px; margin-top: 4px">
                <button class="g-btn g-btn-primary g-btn-sm">Edit profile</button>
                <button class="g-btn g-btn-sm">Share</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Table -->
      <section class="g-glass g-card">
        <h2>Table</h2>
        <div class="g-glass-subtle" style="overflow: hidden">
          <table class="g-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Auth</td>
                <td><span class="g-badge g-success">online</span></td>
                <td class="g-text-muted">2 min ago</td>
              </tr>
              <tr>
                <td>CDN</td>
                <td><span class="g-badge g-warning">degraded</span></td>
                <td class="g-text-muted">10 min ago</td>
              </tr>
              <tr>
                <td>Manager</td>
                <td><span class="g-badge g-error">offline</span></td>
                <td class="g-text-muted">1 h ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <Transition name="fade">
      <div v-if="showDialog" class="ds-overlay g-scrim" @click.self="showDialog = false">
        <div class="g-dialog g-glass-strong" role="dialog" aria-modal="true">
          <div>
            <div style="font-weight: 600">Dialog over a scrim</div>
            <div class="g-text-muted" style="margin-top: 8px; font-size: 14px">Click outside to close.</div>
          </div>
          <div class="g-dialog-actions">
            <button class="g-btn g-btn-primary" @click="showDialog = false">OK</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.ds {
  position: fixed;
  inset: 0;
  overflow-y: auto;
}

.ds-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1100px;
  margin: 0 auto;
  padding: 16px 16px 64px;
}

.ds-logo {
  display: flex;
  border-radius: 50%;
  outline: none;
  transition:
    transform var(--g-duration),
    box-shadow var(--g-duration);

  img {
    width: 36px;
    height: 36px;
  }

  &:hover {
    transform: scale(1.06);
  }

  &:focus-visible {
    box-shadow: var(--g-ring);
  }
}

.ds-session {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 14px 4px 4px;
  /* avatar corner (22% of 36px) + padding, so both corners follow the same curve */
  border-radius: 12px;
  transition: border-radius var(--g-duration);

  &.round {
    border-radius: var(--g-radius-pill);
  }
}

.ds-title {
  margin: 24px 0 0;
  font-size: 32px;
}

h2 {
  margin: 0 0 16px;
  font-size: 20px;
}

h3 {
  margin: 20px 0 10px;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--g-text-muted);
}

.ds-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.ds-cols {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.ds-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.ds-surface {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 20px;
  min-height: 80px;
  font-size: 14px;
}

.ds-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 110px;
  height: 64px;
  border-radius: var(--g-radius-md);
  font-size: 13px;
  font-weight: 500;
}

.ds-swatches {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 14px;
}

.ds-swatch {
  display: flex;
  flex-direction: column;
  gap: 6px;

  span {
    height: 48px;
    border-radius: var(--g-radius-md);
    box-shadow: var(--g-highlight), var(--g-shadow-sm);
  }

  small {
    color: var(--g-text-muted);
  }
}

.ds-full {
  width: 100%;
}

.ds-loading {
  padding: 16px;
  border-radius: var(--g-radius-md);
}

.ds-dialog-stage {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.ds-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 160px;
  color: var(--g-text);
  font-weight: 700;
  text-decoration: none;
}

.ds-tile-icon {
  width: 120px;
  height: 120px;
}

.ds-profile {
  display: flex;
  align-items: center;
  gap: 24px;
}

.ds-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
