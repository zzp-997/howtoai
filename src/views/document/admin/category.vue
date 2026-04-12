<template>
  <Root title="分类管理" back-url="/admin/document">
    <div class="min-h-screen bg-[#f5f7fa]">
      <!-- 新增按钮 -->
      <div class="p-[24px] px-[32px]">
        <t-button theme="primary" block size="large" class="h-[88px] text-[30px] rounded-[24px] !bg-gradient-to-br !from-[#0052D9] !to-[#266FE8]" @click="handleAdd">
          <template #icon><AddIcon /></template>
          新增分类
        </t-button>
      </div>

      <!-- 分类列表 -->
      <div class="px-[32px]">
        <div class="flex justify-between items-center mb-[20px]">
          <div class="text-[32px] font-semibold text-[#333]">分类列表</div>
          <div class="text-[26px] text-[#999]">共 {{ categories.length }} 个</div>
        </div>

        <div v-if="categories.length === 0" class="text-center py-[80px]">
          <FolderIcon class="text-[80px] text-[#ddd] mb-[20px]" />
          <div class="text-[28px] text-[#999]">暂无分类</div>
        </div>

        <div v-for="cat in categories" :key="cat.id" class="flex justify-between items-center bg-white rounded-[24px] p-[24px] mb-[16px] shadow-sm">
          <div class="text-[30px] font-semibold text-[#333]">{{ cat.name }}</div>
          <div class="flex gap-[10px]">
            <t-button theme="primary" variant="outline" size="small" @click="handleEdit(cat)">编辑</t-button>
            <t-button theme="danger" variant="outline" size="small" @click="handleDelete(cat)">删除</t-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <t-dialog v-model:visible="showDialog" :title="editCategory ? '编辑分类' : '新增分类'" :confirm-btn="{ content: '保存', theme: 'primary' }" @confirm="handleSave">
      <div class="p-[20px]">
        <t-input v-model="form.name" placeholder="请输入分类名称" label="分类名称" />
      </div>
    </t-dialog>
  </Root>
</template>

<script setup>
import { AddIcon, FolderIcon } from "tdesign-icons-vue-next"
import { documentCategoryRepo } from "@/db/repositories"
import { showToast, showConfirmDialog } from "@/utils/common/tools"

const categories = ref([])
const showDialog = ref(false)
const editCategory = ref(null)
const form = reactive({ name: "" })

const loadCategories = async () => { categories.value = await documentCategoryRepo.findAllOrdered() }

const handleAdd = () => {
  editCategory.value = null
  form.name = ""
  showDialog.value = true
}

const handleEdit = (cat) => {
  editCategory.value = cat
  form.name = cat.name
  showDialog.value = true
}

const handleSave = async () => {
  if (!form.name.trim()) { showToast("请输入分类名称"); return }
  if (editCategory.value) {
    await documentCategoryRepo.update(editCategory.value.id, { name: form.name.trim() })
    showToast("修改成功")
  } else {
    await documentCategoryRepo.create({ name: form.name.trim(), createdAt: new Date() })
    showToast("添加成功")
  }
  showDialog.value = false
  loadCategories()
}

const handleDelete = async (cat) => {
  try {
    await showConfirmDialog({ content: `确定删除分类「${cat.name}」吗？` })
    await documentCategoryRepo.delete(cat.id)
    showToast("已删除")
    loadCategories()
  } catch (e) {
    // 用户取消操作
  }
}

onMounted(() => loadCategories())
</script>
