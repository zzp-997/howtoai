<template>
  <Root title="会议室管理" back-url="/admin/meeting">
    <div class="min-h-screen bg-[#f5f7fa]">
      <!-- 新增按钮 -->
      <div class="p-[24px] px-[32px]">
        <t-button theme="primary" block size="large" class="h-[88px] text-[30px] rounded-[24px] !bg-gradient-to-br !from-[#0052D9] !to-[#266FE8]" @click="handleAdd">
          <template #icon><AddIcon /></template>
          新增会议室
        </t-button>
      </div>

      <!-- 会议室列表 -->
      <div class="px-[32px]">
        <div class="flex justify-between items-center mb-[20px]">
          <div class="text-[32px] font-semibold text-[#333]">会议室列表</div>
          <div class="text-[26px] text-[#999]">共 {{ rooms.length }} 间</div>
        </div>

        <div v-if="rooms.length === 0" class="text-center py-[80px]">
          <FolderIcon class="text-[80px] text-[#ddd] mb-[20px]" />
          <div class="text-[28px] text-[#999]">暂无会议室</div>
        </div>

        <div v-for="room in rooms" :key="room.id" class="bg-white rounded-[24px] mb-[16px] overflow-hidden shadow-sm">
          <div class="flex items-center p-[24px] gap-[16px]">
            <div class="w-[72px] h-[72px] bg-gradient-to-br from-[#0052D9] to-[#266FE8] rounded-[24px] flex items-center justify-center flex-shrink-0">
              <HomeIcon class="text-[36px] text-white" />
            </div>
            <div class="flex-1">
              <div class="text-[30px] font-semibold text-[#333] mb-[8px]">{{ room.name }}</div>
              <div class="flex items-center gap-[6px] text-[24px] text-[#999]">
                <UserIcon class="text-[24px]" />
                容纳 {{ room.capacity }} 人
              </div>
            </div>
            <div class="flex flex-col gap-[10px]">
              <t-button theme="primary" variant="outline" size="small" @click="handleEdit(room)">编辑</t-button>
              <t-button theme="danger" variant="outline" size="small" @click="handleDelete(room)">删除</t-button>
            </div>
          </div>
          <div v-if="room.equipment?.length" class="px-[24px] py-[16px] bg-[#f9fafb] border-t border-[#f0f0f0]">
            <div class="text-[22px] text-[#999] mb-[12px]">设备</div>
            <div class="flex flex-wrap gap-[10px]">
              <t-tag v-for="eq in room.equipment" :key="eq" theme="primary" variant="light" size="small">{{ eq }}</t-tag>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <t-popup v-model="showDialog" placement="bottom" round>
      <div class="bg-white rounded-t-[32px] overflow-hidden">
        <!-- 弹窗头部 -->
        <div class="flex items-center justify-between p-[32px] bg-gradient-to-br from-[#0052D9] to-[#266FE8]">
          <div class="text-[32px] font-bold text-white">{{ editRoom ? '编辑会议室' : '新增会议室' }}</div>
          <div class="w-[48px] h-[48px] bg-white/20 rounded-full flex items-center justify-center" @click="showDialog = false">
            <CloseIcon class="text-[24px] text-white" />
          </div>
        </div>
        <!-- 弹窗内容 -->
        <div class="p-[32px]">
          <div class="mb-[24px]">
            <div class="text-[26px] text-[#666] mb-[12px]">会议室名称</div>
            <t-input v-model="form.name" placeholder="请输入会议室名称" :bordered="false" class="bg-[#f5f7fa] rounded-[16px] px-[24px] py-[20px] text-[28px]" />
          </div>
          <div class="mb-[24px]">
            <div class="text-[26px] text-[#666] mb-[12px]">容纳人数</div>
            <t-input v-model.number="form.capacity" placeholder="请输入容纳人数" type="number" :bordered="false" class="bg-[#f5f7fa] rounded-[16px] px-[24px] py-[20px] text-[28px]" />
          </div>
          <div class="mb-[32px]">
            <div class="text-[26px] text-[#666] mb-[12px]">设备配置</div>
            <t-input v-model="form.equipmentStr" placeholder="用逗号分隔，如：投影仪,白板" :bordered="false" class="bg-[#f5f7fa] rounded-[16px] px-[24px] py-[20px] text-[28px]" />
          </div>
          <!-- 操作按钮 -->
          <div class="flex gap-[16px]">
            <t-button theme="default" block class="h-[80px] text-[28px] rounded-[16px]" @click="showDialog = false">取消</t-button>
            <t-button theme="primary" block class="h-[80px] text-[28px] rounded-[16px] !bg-gradient-to-br !from-[#0052D9] !to-[#266FE8]" @click="handleSave">保存</t-button>
          </div>
        </div>
      </div>
    </t-popup>
  </Root>
</template>

<script setup>
import { AddIcon, FolderIcon, HomeIcon, UserIcon, CloseIcon } from "tdesign-icons-vue-next"
import { getMeetingRooms, createMeetingRoom, updateMeetingRoom, deleteMeetingRoom } from "@/api/meeting-rooms"
import { showToast, showConfirmDialog } from "@/utils/common/tools"

const rooms = ref([])
const showDialog = ref(false)
const editRoom = ref(null)
const form = reactive({ name: '', capacity: 10, equipmentStr: '' })

const loadRooms = async () => {
  const res = await getMeetingRooms()
  rooms.value = res.data || []
}

const handleAdd = () => {
  editRoom.value = null
  form.name = ''; form.capacity = 10; form.equipmentStr = ''
  showDialog.value = true
}

const handleEdit = (room) => {
  editRoom.value = room
  form.name = room.name; form.capacity = room.capacity; form.equipmentStr = room.equipment?.join(',') || ''
  showDialog.value = true
}

const handleSave = async () => {
  if (!form.name.trim()) { showToast('请输入会议室名称'); return }
  const data = {
    name: form.name.trim(),
    capacity: form.capacity,
    equipment: form.equipmentStr.split(',').map(s => s.trim()).filter(Boolean)
  }
  if (editRoom.value) {
    await updateMeetingRoom(editRoom.value.id, data)
    showToast('修改成功')
  } else {
    await createMeetingRoom(data)
    showToast('添加成功')
  }
  showDialog.value = false
  loadRooms()
}

const handleDelete = async (room) => {
  try {
    await showConfirmDialog({ content: `确定删除「${room.name}」吗？` })
    await deleteMeetingRoom(room.id)
    showToast('已删除')
    loadRooms()
  } catch (e) {
    // 用户取消操作
  }
}

onMounted(() => loadRooms())
</script>
