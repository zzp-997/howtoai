<template>
  <Root title="设置" back-url="/user">
    <div class="min-h-screen bg-[var(--bg-secondary)] pb-[150px]">
      <!-- 外观设置 -->
      <div class="p-[24px] px-[32px]">
        <div class="text-[26px] text-[var(--text-tertiary)] mb-[16px]">外观</div>
        <div class="bg-[var(--bg-primary)] rounded-[24px] shadow-sm overflow-hidden">
          <!-- 主题模式 -->
          <div class="p-[24px] border-b border-[var(--border-color)] cursor-pointer" @click="showThemePicker = true">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-[16px]">
                <div class="w-[48px] h-[48px] rounded-[12px] bg-gradient-to-br from-[#0052D9] to-[#266FE8] flex items-center justify-center">
                  <SettingIcon class="text-[24px] text-white" />
                </div>
                <div>
                  <div class="text-[28px] text-[var(--text-primary)]">主题模式</div>
                  <div class="text-[22px] text-[var(--text-tertiary)]">{{ themeLabel }}</div>
                </div>
              </div>
              <ChevronRightIcon class="text-[24px] text-[var(--text-tertiary)]" />
            </div>
          </div>

          <!-- 字体大小 -->
          <div class="p-[24px] border-b border-[var(--border-color)]">
            <div class="flex items-center justify-between mb-[16px]">
              <div class="flex items-center gap-[16px]">
                <div class="w-[48px] h-[48px] rounded-[12px] bg-gradient-to-br from-[#00A870] to-[#2BA471] flex items-center justify-center text-[20px] text-white font-bold">
                  Aa
                </div>
                <div class="text-[28px] text-[var(--text-primary)]">字体大小</div>
              </div>
            </div>
            <div class="flex gap-[12px]">
              <div v-for="size in fontSizes" :key="size.value"
                :class="['flex-1 text-center py-[16px] rounded-[12px] transition-all', settingsStore.fontSize === size.value ? 'bg-gradient-to-br from-[#00A870] to-[#2BA471] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]']"
                @click="settingsStore.setFontSize(size.value)">
                <div class="text-[24px]">{{ size.label }}</div>
              </div>
            </div>
          </div>

          <!-- 紧凑模式 -->
          <div class="p-[24px] border-b border-[var(--border-color)]">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-[16px]">
                <div class="w-[48px] h-[48px] rounded-[12px] bg-gradient-to-br from-[#ED7B2F] to-[#F09143] flex items-center justify-center">
                  <ViewListIcon class="text-[24px] text-white" />
                </div>
                <div>
                  <div class="text-[28px] text-[var(--text-primary)]">紧凑模式</div>
                  <div class="text-[22px] text-[var(--text-tertiary)]">减少间距，显示更多内容</div>
                </div>
              </div>
              <t-switch v-model="compactModeValue" @change="settingsStore.setCompactMode" />
            </div>
          </div>

          <!-- 震动反馈 -->
          <div class="p-[24px]">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-[16px]">
                <div class="w-[48px] h-[48px] rounded-[12px] bg-gradient-to-br from-[#7B61FF] to-[#9B8AFF] flex items-center justify-center">
                  <span class="text-[24px]">📳</span>
                </div>
                <div>
                  <div class="text-[28px] text-[var(--text-primary)]">震动反馈</div>
                  <div class="text-[22px] text-[var(--text-tertiary)]">操作成功时震动提示</div>
                </div>
              </div>
              <t-switch v-model="vibrationValue" @change="handleVibrationChange" />
            </div>
          </div>
        </div>
      </div>

      <!-- 数据管理 -->
      <div class="px-[32px] pb-[24px]">
        <div class="text-[26px] text-[var(--text-tertiary)] mb-[16px]">数据管理</div>
        <div class="bg-[var(--bg-primary)] rounded-[24px] shadow-sm overflow-hidden">
          <!-- 数据备份 -->
          <div class="p-[24px] border-b border-[var(--border-color)]" @click="handleExport">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-[16px]">
                <div class="w-[48px] h-[48px] rounded-[12px] bg-gradient-to-br from-[#7B61FF] to-[#9B8AFF] flex items-center justify-center text-[20px] text-white">
                  ↓
                </div>
                <div>
                  <div class="text-[28px] text-[var(--text-primary)]">数据备份</div>
                  <div class="text-[22px] text-[var(--text-tertiary)]">导出数据到本地文件</div>
                </div>
              </div>
              <ChevronRightIcon class="text-[24px] text-[var(--text-tertiary)]" />
            </div>
          </div>

          <!-- 数据恢复 -->
          <div class="p-[24px] border-b border-[var(--border-color)]" @click="triggerImport">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-[16px]">
                <div class="w-[48px] h-[48px] rounded-[12px] bg-gradient-to-br from-[#0052D9] to-[#266FE8] flex items-center justify-center text-[20px] text-white">
                  ↑
                </div>
                <div>
                  <div class="text-[28px] text-[var(--text-primary)]">数据恢复</div>
                  <div class="text-[22px] text-[var(--text-tertiary)]">从备份文件恢复数据</div>
                </div>
              </div>
              <ChevronRightIcon class="text-[24px] text-[var(--text-tertiary)]" />
            </div>
          </div>

          <!-- 清除数据 -->
          <div class="p-[24px]" @click="handleClearData">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-[16px]">
                <div class="w-[48px] h-[48px] rounded-[12px] bg-gradient-to-br from-[#E34D59] to-[#F06956] flex items-center justify-center">
                  <DeleteIcon class="text-[24px] text-white" />
                </div>
                <div>
                  <div class="text-[28px] text-[var(--text-primary)]">清除数据</div>
                  <div class="text-[22px] text-[var(--text-tertiary)]">清空所有本地数据</div>
                </div>
              </div>
              <ChevronRightIcon class="text-[24px] text-[var(--text-tertiary)]" />
            </div>
          </div>
        </div>
      </div>

      <!-- 其他设置 -->
      <div class="px-[32px] pb-[32px]">
        <div class="text-[26px] text-[var(--text-tertiary)] mb-[16px]">其他</div>
        <div class="bg-[var(--bg-primary)] rounded-[24px] shadow-sm overflow-hidden">
          <!-- 默认首页 -->
          <div class="p-[24px] cursor-pointer" @click="showPagePicker = true">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-[16px]">
                <div class="w-[48px] h-[48px] rounded-[12px] bg-gradient-to-br from-[#0052D9] to-[#266FE8] flex items-center justify-center">
                  <HomeIcon class="text-[24px] text-white" />
                </div>
                <div>
                  <div class="text-[28px] text-[var(--text-primary)]">默认首页</div>
                  <div class="text-[22px] text-[var(--text-tertiary)]">{{ defaultPageLabel }}</div>
                </div>
              </div>
              <ChevronRightIcon class="text-[24px] text-[var(--text-tertiary)]" />
            </div>
          </div>
        </div>
      </div>

      <!-- 版本信息 -->
      <div class="text-center py-[32px] pb-[160px]">
        <div class="text-[22px] text-[var(--text-tertiary)]">极智协同 v1.0.0</div>
        <div v-if="deployVersion" class="text-[20px] text-[var(--text-tertiary)] mt-[8px]">
          构建: {{ deployVersion.commit }} · {{ deployVersion.deploy_time }}
        </div>
      </div>
    </div>

    <!-- 主题选择弹窗 -->
    <t-popup v-model="showThemePicker" placement="bottom" round>
      <div class="bg-[var(--bg-primary)] rounded-t-[24px]">
        <div class="p-[24px] text-center border-b border-[var(--border-color)]">
          <div class="text-[30px] font-semibold text-[var(--text-primary)]">选择主题</div>
        </div>
        <div v-for="theme in themes" :key="theme.value" class="p-[24px] border-b border-[var(--border-color)] flex items-center justify-between" @click="handleThemeSelect(theme.value)">
          <div class="flex items-center gap-[16px]">
            <div v-if="theme.icon === 'sun'" class="w-[32px] h-[32px] rounded-full bg-[#ED7B2F] flex items-center justify-center text-white text-[18px]">☀</div>
            <div v-else-if="theme.icon === 'moon'" class="w-[32px] h-[32px] rounded-full bg-[#0052D9] flex items-center justify-center text-white text-[18px]">🌙</div>
            <TimeIcon v-else class="text-[32px]" :style="{ color: theme.color }" />
            <div>
              <div class="text-[28px] text-[var(--text-primary)]">{{ theme.label }}</div>
              <div class="text-[22px] text-[var(--text-tertiary)]">{{ theme.desc }}</div>
            </div>
          </div>
          <CheckIcon v-if="settingsStore.theme === theme.value" class="text-[28px] text-[#0052D9]" />
        </div>
        <div class="p-[24px] text-center" @click="showThemePicker = false">
          <div class="text-[28px] text-[var(--text-secondary)]">取消</div>
        </div>
      </div>
    </t-popup>

    <!-- 默认首页选择弹窗 -->
    <t-popup v-model="showPagePicker" placement="bottom" round>
      <div class="bg-[var(--bg-primary)] rounded-t-[24px]">
        <div class="p-[24px] text-center border-b border-[var(--border-color)]">
          <div class="text-[30px] font-semibold text-[var(--text-primary)]">选择默认首页</div>
        </div>
        <div v-for="page in defaultPages" :key="page.value" class="p-[24px] border-b border-[var(--border-color)] flex items-center justify-between" @click="handlePageSelect(page.value)">
          <div class="text-[28px] text-[var(--text-primary)]">{{ page.label }}</div>
          <CheckIcon v-if="settingsStore.defaultPage === page.value" class="text-[28px] text-[#0052D9]" />
        </div>
        <div class="p-[24px] text-center" @click="showPagePicker = false">
          <div class="text-[28px] text-[var(--text-secondary)]">取消</div>
        </div>
      </div>
    </t-popup>

    <!-- 隐藏的文件输入 -->
    <input ref="fileInput" type="file" accept=".json" style="display: none" @change="handleImport" />
  </Root>
</template>

<script setup>
import {
  ChevronRightIcon,
  CheckIcon,
  TimeIcon,
  DeleteIcon,
  HomeIcon,
  ViewListIcon,
  SettingIcon
} from "tdesign-icons-vue-next"
import { useSettingsStore } from "@/store/modules/settings"
import { showToast, showConfirmDialog } from "@/utils/common/tools"
import { ref, computed, onMounted } from "vue"
import { useUserStore } from "@/store"
import { useRouter } from "vue-router"

const settingsStore = useSettingsStore()
const userStore = useUserStore()
const router = useRouter()
const fileInput = ref(null)
const showThemePicker = ref(false)
const showPagePicker = ref(false)
const deployVersion = ref(null)

// 获取部署版本信息
onMounted(async () => {
  try {
    const response = await fetch('/version.json')
    if (response.ok) {
      deployVersion.value = await response.json()
    }
  } catch (e) {
    console.log('获取版本信息失败')
  }
})

// 响应式绑定
const compactModeValue = computed({
  get: () => settingsStore.compactMode,
  set: () => {}
})

const vibrationValue = computed({
  get: () => settingsStore.vibration,
  set: () => {}
})

// 震动反馈切换
const handleVibrationChange = (value) => {
  settingsStore.setVibration(value)
  // 切换时测试震动
  if (value && navigator.vibrate) {
    navigator.vibrate(50)
  }
}

// 主题配置
const themes = [
  { value: 'light', label: '日间模式', desc: '浅色背景，适合白天使用', icon: 'sun', color: '#ED7B2F' },
  { value: 'dark', label: '夜间模式', desc: '深色背景，护眼省电', icon: 'moon', color: '#0052D9' },
  { value: 'system', label: '跟随系统', desc: '自动适配系统主题', icon: TimeIcon, color: '#00A870' }
]

const themeLabel = computed(() => {
  const theme = themes.find(t => t.value === settingsStore.theme)
  return theme?.label || '日间模式'
})

// 字体大小配置
const fontSizes = [
  { value: 'small', label: '小' },
  { value: 'medium', label: '中' },
  { value: 'large', label: '大' }
]

// 默认首页配置
const defaultPages = [
  { value: '/user', label: '首页' },
  { value: '/user/todo', label: '我的待办' },
  { value: '/user/attendance', label: '考勤打卡' },
  { value: '/user/meeting', label: '会议预定' },
  { value: '/user/announcement', label: '公告通知' }
]

const defaultPageLabel = computed(() => {
  const page = defaultPages.find(p => p.value === settingsStore.defaultPage)
  return page?.label || '首页'
})

// 主题选择
const handleThemeSelect = (theme) => {
  settingsStore.setTheme(theme)
  showThemePicker.value = false
}

// 默认首页选择
const handlePageSelect = (page) => {
  settingsStore.setDefaultPage(page)
  showPagePicker.value = false
}

// 数据导出（已禁用，数据存储在服务器端）
const handleExport = async () => {
  showToast('数据备份功能暂不可用，数据已存储在服务器端')
}

// 触发文件选择
const triggerImport = () => {
  showToast('数据恢复功能暂不可用，数据已存储在服务器端')
}

// 数据导入（已禁用）
const handleImport = async (event) => {
  // 不再需要
}

// 清除数据
const handleClearData = async () => {
  try {
    await showConfirmDialog({
      title: '确认退出',
      content: '此操作将退出登录并清除本地缓存。确定要继续吗？',
      confirmBtn: '确认',
      cancelBtn: '取消'
    })
    // 清除用户状态
    await userStore.logout()
    // 清除本地存储
    localStorage.clear()
    showToast('已退出登录')
    // 跳转登录页
    router.push('/login')
  } catch {
    // 用户取消
  }
}
</script>