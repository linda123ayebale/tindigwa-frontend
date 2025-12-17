# ConfirmDeleteModal Usage Examples

This is a reusable confirmation modal for delete operations across the application.

## Basic Usage

```jsx
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';

// In your component state
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [itemToDelete, setItemToDelete] = useState(null);
const [isDeleting, setIsDeleting] = useState(false);

// JSX
<ConfirmDeleteModal
  isOpen={showDeleteModal}
  itemType="client"
  itemName={itemToDelete?.name}
  itemDetails={[
    `ID: ${itemToDelete?.id}`,
    `Phone: ${itemToDelete?.phone}`
  ]}
  onConfirm={handleDeleteConfirm}
  onCancel={handleDeleteCancel}
  isDeleting={isDeleting}
/>
```

## Examples for Different Modules

### 1. Client Deletion
```jsx
<ConfirmDeleteModal
  isOpen={showDeleteModal}
  itemType="client"
  itemName="John Doe"
  itemDetails={[
    "National ID: CF123456789",
    "Phone: 0712345678"
  ]}
  onConfirm={handleDeleteConfirm}
  onCancel={handleDeleteCancel}
  isDeleting={isDeleting}
/>
```

### 2. Loan Deletion
```jsx
<ConfirmDeleteModal
  isOpen={showDeleteModal}
  itemType="loan"
  itemName="Loan #LN001234"
  itemDetails={[
    "Client: John Doe",
    "Amount: UGX 500,000",
    "Status: Active"
  ]}
  onConfirm={handleDeleteConfirm}
  onCancel={handleDeleteCancel}
  isDeleting={isDeleting}
/>
```

### 3. Staff Deletion
```jsx
<ConfirmDeleteModal
  isOpen={showDeleteModal}
  itemType="staff member"
  itemName="Jane Smith"
  itemDetails={[
    "Role: Loan Officer",
    "Employee ID: EMP001",
    "Email: jane.smith@company.com"
  ]}
  onConfirm={handleDeleteConfirm}
  onCancel={handleDeleteCancel}
  isDeleting={isDeleting}
/>
```

### 4. Payment Deletion
```jsx
<ConfirmDeleteModal
  isOpen={showDeleteModal}
  itemType="payment"
  itemName="Payment #PAY001234"
  itemDetails={[
    "Amount: UGX 50,000",
    "Date: 2024-01-15",
    "Loan: LN001234"
  ]}
  onConfirm={handleDeleteConfirm}
  onCancel={handleDeleteCancel}
  isDeleting={isDeleting}
/>
```

### 5. Custom Messages
```jsx
<ConfirmDeleteModal
  isOpen={showDeleteModal}
  itemType="document"
  itemName="Financial Report Q4 2023"
  customTitle="Delete Important Document"
  customMessage="This document contains critical financial data. Are you absolutely sure you want to delete it?"
  customWarning="THIS DOCUMENT CANNOT BE RECOVERED!"
  itemDetails={[
    "Type: PDF Document",
    "Size: 2.5 MB",
    "Created: 2024-01-01"
  ]}
  onConfirm={handleDeleteConfirm}
  onCancel={handleDeleteCancel}
  isDeleting={isDeleting}
/>
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | boolean | false | Whether the modal is visible |
| `itemType` | string | 'item' | Type of item being deleted (client, loan, staff, etc.) |
| `itemName` | string | - | Name/identifier of the item to delete |
| `itemDetails` | array | [] | Array of detail strings to display |
| `onConfirm` | function | - | Function called when delete is confirmed |
| `onCancel` | function | - | Function called when delete is cancelled |
| `isDeleting` | boolean | false | Whether deletion is in progress |
| `customTitle` | string | - | Custom title (overrides default) |
| `customMessage` | string | - | Custom message (overrides default) |
| `customWarning` | string | - | Custom warning text (overrides default) |

## Handler Functions Pattern

```jsx
const handleDeleteItem = (item) => {
  setItemToDelete(item);
  setShowDeleteModal(true);
};

const handleDeleteConfirm = async () => {
  if (!itemToDelete) return;
  
  try {
    setIsDeleting(true);
    await YourService.deleteItem(itemToDelete.id);
    
    // Update local state
    setItems(prevItems => prevItems.filter(item => item.id !== itemToDelete.id));
    
    // Show success notification
    showSuccess(`${itemToDelete.name} has been deleted successfully.`);
    
    // Close modal
    setShowDeleteModal(false);
    setItemToDelete(null);
    
  } catch (error) {
    showError(`Failed to delete ${itemToDelete.name}: ${error.message}`);
  } finally {
    setIsDeleting(false);
  }
};

const handleDeleteCancel = () => {
  setShowDeleteModal(false);
  setItemToDelete(null);
  setIsDeleting(false);
};
```

## Features

✅ **Reusable** - Works for any type of item  
✅ **Customizable** - Override titles, messages, and warnings  
✅ **Loading States** - Shows spinner during deletion  
✅ **Accessible** - Proper ARIA labels and keyboard support  
✅ **Responsive** - Mobile-friendly design  
✅ **Professional** - Matches app design system  
✅ **Safe** - Prevents accidental deletions with clear warnings