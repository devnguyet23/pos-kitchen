import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// =============================================
// PERMISSIONS DATA
// =============================================
const PERMISSIONS = [
                    // Chain management
                    { name: 'Xem tất cả chuỗi', code: 'view_chains', module: 'chain' },
                    { name: 'Xem chuỗi của mình', code: 'view_own_chain', module: 'chain' },
                    { name: 'Tạo chuỗi', code: 'create_chain', module: 'chain' },
                    { name: 'Sửa chuỗi', code: 'edit_chain', module: 'chain' },
                    { name: 'Xóa chuỗi', code: 'delete_chain', module: 'chain' },
                    { name: 'Cấu hình chuỗi', code: 'configure_chain', module: 'chain' },

                    // Store management
                    { name: 'Xem tất cả cửa hàng', code: 'view_stores', module: 'store' },
                    { name: 'Xem cửa hàng của mình', code: 'view_own_store', module: 'store' },
                    { name: 'Tạo cửa hàng', code: 'create_store', module: 'store' },
                    { name: 'Sửa cửa hàng', code: 'edit_store', module: 'store' },
                    { name: 'Xóa cửa hàng', code: 'delete_store', module: 'store' },
                    { name: 'Cấu hình cửa hàng', code: 'configure_store', module: 'store' },

                    // User management
                    { name: 'Xem tất cả nhân viên', code: 'view_users', module: 'user' },
                    { name: 'Xem nhân viên cửa hàng', code: 'view_store_users', module: 'user' },
                    { name: 'Tạo nhân viên', code: 'create_user', module: 'user' },
                    { name: 'Sửa nhân viên', code: 'edit_user', module: 'user' },
                    { name: 'Xóa nhân viên', code: 'delete_user', module: 'user' },
                    { name: 'Phân quyền', code: 'assign_roles', module: 'user' },
                    { name: 'Reset mật khẩu', code: 'reset_password', module: 'user' },
                    { name: 'Khóa/mở tài khoản', code: 'lock_unlock_user', module: 'user' },

                    // Sales
                    { name: 'Xem tất cả đơn hàng', code: 'view_orders', module: 'sales' },
                    { name: 'Xem đơn của mình', code: 'view_own_orders', module: 'sales' },
                    { name: 'Tạo đơn hàng', code: 'create_order', module: 'sales' },
                    { name: 'Sửa đơn hàng', code: 'edit_order', module: 'sales' },
                    { name: 'Xóa đơn hàng', code: 'delete_order', module: 'sales' },
                    { name: 'Hủy đơn hàng', code: 'cancel_order', module: 'sales' },
                    { name: 'Hoàn trả không giới hạn', code: 'process_refund_unlimited', module: 'sales' },
                    { name: 'Hoàn trả có giới hạn', code: 'process_refund_limited', module: 'sales' },
                    { name: 'Duyệt hoàn trả', code: 'approve_refund', module: 'sales' },
                    { name: 'Giảm giá không giới hạn', code: 'apply_discount_unlimited', module: 'sales' },
                    { name: 'Giảm giá có giới hạn', code: 'apply_discount_limited', module: 'sales' },
                    { name: 'Thanh toán', code: 'process_payment', module: 'sales' },
                    { name: 'In hóa đơn', code: 'print_invoice', module: 'sales' },

                    // Inventory
                    { name: 'Xem tồn kho tất cả', code: 'view_inventory_all', module: 'inventory' },
                    { name: 'Xem tồn kho cửa hàng', code: 'view_inventory', module: 'inventory' },
                    { name: 'Nhập kho', code: 'stock_in', module: 'inventory' },
                    { name: 'Xuất kho', code: 'stock_out', module: 'inventory' },
                    { name: 'Kiểm kê', code: 'stock_take', module: 'inventory' },
                    { name: 'Điều chỉnh tồn kho', code: 'adjust_inventory', module: 'inventory' },
                    { name: 'Chuyển kho', code: 'transfer_inventory', module: 'inventory' },

                    // Products
                    { name: 'Xem sản phẩm', code: 'view_products', module: 'product' },
                    { name: 'Tạo sản phẩm', code: 'create_product', module: 'product' },
                    { name: 'Sửa sản phẩm', code: 'edit_product', module: 'product' },
                    { name: 'Xóa sản phẩm', code: 'delete_product', module: 'product' },
                    { name: 'Quản lý giá', code: 'manage_product_price', module: 'product' },
                    { name: 'Quản lý danh mục', code: 'manage_categories', module: 'product' },

                    // Shifts
                    { name: 'Xem tất cả ca', code: 'view_shifts', module: 'shift' },
                    { name: 'Xem ca của mình', code: 'view_own_shifts', module: 'shift' },
                    { name: 'Tạo ca làm việc', code: 'create_shift', module: 'shift' },
                    { name: 'Mở ca', code: 'open_shift', module: 'shift' },
                    { name: 'Đóng ca', code: 'close_shift', module: 'shift' },
                    { name: 'Đóng ca người khác', code: 'close_others_shift', module: 'shift' },
                    { name: 'Đối soát ca', code: 'reconcile_shift', module: 'shift' },

                    // Reports
                    { name: 'Xem báo cáo hệ thống', code: 'view_system_reports', module: 'report' },
                    { name: 'Xem báo cáo chuỗi', code: 'view_chain_reports', module: 'report' },
                    { name: 'Xem báo cáo cửa hàng', code: 'view_store_reports', module: 'report' },
                    { name: 'Xem báo cáo doanh thu', code: 'view_revenue_reports', module: 'report' },
                    { name: 'Xem báo cáo tồn kho', code: 'view_inventory_reports', module: 'report' },
                    { name: 'Export dữ liệu', code: 'export_data', module: 'report' },
                    { name: 'Xem dashboard', code: 'view_dashboard', module: 'report' },

                    // System
                    { name: 'Cấu hình hệ thống', code: 'configure_system', module: 'system' },
                    { name: 'Xem audit logs', code: 'view_audit_logs', module: 'system' },
                    { name: 'Xem system logs', code: 'view_system_logs', module: 'system' },
                    { name: 'Backup database', code: 'backup_database', module: 'system' },
];

// =============================================
// ROLES DATA
// =============================================
const ROLES = [
                    { name: 'Super Admin', code: 'super_admin', level: 1, description: 'Quản trị viên hệ thống', color: '#dc2626' },
                    { name: 'Chain Owner', code: 'chain_owner', level: 2, description: 'Chủ chuỗi', color: '#7c3aed' },
                    { name: 'Chain Admin', code: 'chain_admin', level: 2, description: 'Quản trị chuỗi', color: '#2563eb' },
                    { name: 'Store Manager', code: 'store_manager', level: 3, description: 'Quản lý cửa hàng', color: '#059669' },
                    { name: 'Assistant Manager', code: 'assistant_manager', level: 3, description: 'Phó quản lý', color: '#10b981' },
                    { name: 'Cashier', code: 'cashier', level: 3, description: 'Thu ngân', color: '#f59e0b' },
                    { name: 'Warehouse Staff', code: 'warehouse_staff', level: 3, description: 'Nhân viên kho', color: '#6366f1' },
                    { name: 'Accountant', code: 'accountant', level: 2, description: 'Kế toán', color: '#8b5cf6' },
                    { name: 'Viewer', code: 'viewer', level: 2, description: 'Người xem', color: '#6b7280' },
];

// Permission assignments per role
const ROLE_PERMISSIONS: Record<string, string[]> = {
                    super_admin: ['*'], // All permissions

                    chain_owner: [
                                        'view_own_chain', 'edit_chain', 'configure_chain',
                                        'view_stores', 'view_own_store', 'create_store', 'edit_store', 'delete_store', 'configure_store',
                                        'view_users', 'view_store_users', 'create_user', 'edit_user', 'delete_user', 'assign_roles', 'reset_password', 'lock_unlock_user',
                                        'view_orders', 'view_own_orders', 'create_order', 'edit_order', 'delete_order', 'cancel_order',
                                        'process_refund_unlimited', 'process_refund_limited', 'approve_refund',
                                        'apply_discount_unlimited', 'apply_discount_limited', 'process_payment', 'print_invoice',
                                        'view_inventory_all', 'view_inventory', 'stock_in', 'stock_out', 'stock_take', 'adjust_inventory', 'transfer_inventory',
                                        'view_products', 'create_product', 'edit_product', 'delete_product', 'manage_product_price', 'manage_categories',
                                        'view_shifts', 'view_own_shifts', 'create_shift', 'open_shift', 'close_shift', 'close_others_shift', 'reconcile_shift',
                                        'view_chain_reports', 'view_store_reports', 'view_revenue_reports', 'view_inventory_reports', 'export_data', 'view_dashboard',
                                        'view_audit_logs',
                    ],

                    chain_admin: [
                                        'view_own_chain',
                                        'view_stores', 'view_own_store', 'create_store', 'edit_store', 'configure_store',
                                        'view_users', 'view_store_users', 'create_user', 'edit_user', 'delete_user', 'assign_roles', 'reset_password', 'lock_unlock_user',
                                        'view_orders', 'view_own_orders', 'create_order', 'edit_order', 'cancel_order',
                                        'process_refund_unlimited', 'process_refund_limited', 'approve_refund',
                                        'apply_discount_unlimited', 'apply_discount_limited', 'process_payment', 'print_invoice',
                                        'view_inventory_all', 'view_inventory', 'stock_in', 'stock_out', 'stock_take', 'adjust_inventory', 'transfer_inventory',
                                        'view_products', 'create_product', 'edit_product', 'delete_product', 'manage_product_price', 'manage_categories',
                                        'view_shifts', 'view_own_shifts', 'create_shift', 'open_shift', 'close_shift', 'close_others_shift', 'reconcile_shift',
                                        'view_chain_reports', 'view_store_reports', 'view_revenue_reports', 'view_inventory_reports', 'export_data', 'view_dashboard',
                                        'view_audit_logs',
                    ],

                    store_manager: [
                                        'view_own_store',
                                        'view_store_users', 'create_user', 'edit_user', 'delete_user', 'assign_roles', 'reset_password', 'lock_unlock_user',
                                        'view_orders', 'view_own_orders', 'create_order', 'edit_order', 'delete_order', 'cancel_order',
                                        'process_refund_unlimited', 'process_refund_limited', 'approve_refund',
                                        'apply_discount_unlimited', 'apply_discount_limited', 'process_payment', 'print_invoice',
                                        'view_inventory', 'stock_in', 'stock_out', 'stock_take', 'adjust_inventory',
                                        'view_products', 'edit_product', 'manage_product_price',
                                        'view_shifts', 'view_own_shifts', 'create_shift', 'open_shift', 'close_shift', 'close_others_shift', 'reconcile_shift',
                                        'view_store_reports', 'view_revenue_reports', 'view_inventory_reports', 'export_data', 'view_dashboard',
                                        'view_audit_logs',
                    ],

                    assistant_manager: [
                                        'view_own_store',
                                        'view_store_users',
                                        'view_orders', 'view_own_orders', 'create_order', 'edit_order', 'cancel_order',
                                        'process_refund_limited', 'apply_discount_limited', 'process_payment', 'print_invoice',
                                        'view_inventory',
                                        'view_products',
                                        'view_shifts', 'view_own_shifts', 'create_shift', 'open_shift', 'close_shift', 'reconcile_shift',
                                        'view_store_reports', 'view_dashboard',
                    ],

                    cashier: [
                                        'view_own_store',
                                        'view_own_orders', 'create_order',
                                        'process_refund_limited', 'apply_discount_limited', 'process_payment', 'print_invoice',
                                        'view_inventory',
                                        'view_products',
                                        'view_own_shifts', 'open_shift', 'close_shift', 'reconcile_shift',
                    ],

                    warehouse_staff: [
                                        'view_own_store',
                                        'view_inventory', 'stock_in', 'stock_out', 'stock_take', 'adjust_inventory',
                                        'view_products',
                                        'view_inventory_reports',
                    ],

                    accountant: [
                                        'view_own_chain',
                                        'view_stores', 'view_own_store',
                                        'view_users', 'view_store_users',
                                        'view_orders',
                                        'view_inventory_all', 'view_inventory',
                                        'view_shifts',
                                        'view_chain_reports', 'view_store_reports', 'view_revenue_reports', 'view_inventory_reports', 'export_data', 'view_dashboard',
                                        'view_audit_logs',
                    ],

                    viewer: [
                                        'view_own_chain',
                                        'view_stores', 'view_own_store',
                                        'view_orders',
                                        'view_inventory_all', 'view_inventory',
                                        'view_products',
                                        'view_shifts',
                                        'view_chain_reports', 'view_store_reports', 'view_inventory_reports', 'view_dashboard',
                    ],
};

export async function seedPermissions() {
                    console.log('🔐 Seeding permissions...');

                    // Create permissions
                    for (const perm of PERMISSIONS) {
                                        await prisma.permission.upsert({
                                                            where: { code: perm.code },
                                                            update: { name: perm.name, module: perm.module },
                                                            create: { ...perm, isSystem: true },
                                        });
                    }
                    console.log(`  ✅ Created ${PERMISSIONS.length} permissions`);

                    // Create roles
                    for (const role of ROLES) {
                                        await prisma.role.upsert({
                                                            where: { code: role.code },
                                                            update: { name: role.name, description: role.description, level: role.level, color: role.color },
                                                            create: { ...role, isSystem: true },
                                        });
                    }
                    console.log(`  ✅ Created ${ROLES.length} roles`);

                    // Assign permissions to roles
                    const allPermissions = await prisma.permission.findMany();
                    const allRoles = await prisma.role.findMany();

                    for (const role of allRoles) {
                                        const permCodes = ROLE_PERMISSIONS[role.code] || [];

                                        // Super admin gets all permissions
                                        const permsToAssign = permCodes.includes('*')
                                                            ? allPermissions
                                                            : allPermissions.filter(p => permCodes.includes(p.code));

                                        for (const perm of permsToAssign) {
                                                            await prisma.rolePermission.upsert({
                                                                                where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
                                                                                update: {},
                                                                                create: { roleId: role.id, permissionId: perm.id },
                                                            });
                                        }
                                        console.log(`  ✅ Assigned ${permsToAssign.length} permissions to ${role.name}`);
                    }

                    console.log('✅ Permissions seeding completed!');
}

export async function seedSampleData() {
                    console.log('📦 Seeding sample data...');

                    // Create a default chain
                    const chain = await prisma.chain.upsert({
                                        where: { code: 'DEFAULT' },
                                        update: {},
                                        create: {
                                                            name: 'Chuỗi Mặc Định',
                                                            code: 'DEFAULT',
                                                            status: 'ACTIVE',
                                                            description: 'Chuỗi cửa hàng mặc định',
                                        },
                    });
                    console.log(`  ✅ Created chain: ${chain.name}`);

                    // Create a default store
                    const store = await prisma.store.upsert({
                                        where: { code: 'DEFAULT-STORE' },
                                        update: {},
                                        create: {
                                                            chainId: chain.id,
                                                            name: 'Cửa hàng chính',
                                                            code: 'DEFAULT-STORE',
                                                            address: '123 Đường ABC, Quận 1, TP.HCM',
                                                            phone: '0901234567',
                                                            status: 'ACTIVE',
                                        },
                    });
                    console.log(`  ✅ Created store: ${store.name}`);

                    // Create super admin
                    const hashedPassword = await bcrypt.hash('admin123', 10);

                    const superAdmin = await prisma.user.upsert({
                                        where: { username: 'superadmin' },
                                        update: {},
                                        create: {
                                                            username: 'superadmin',
                                                            email: 'superadmin@pos.local',
                                                            password: hashedPassword,
                                                            fullName: 'Super Administrator',
                                                            status: 'ACTIVE',
                                        },
                    });

                    // Assign super_admin role
                    const superAdminRole = await prisma.role.findUnique({ where: { code: 'super_admin' } });
                    if (superAdminRole) {
                                        await prisma.userRole.upsert({
                                                            where: {
                                                                                userId_roleId_chainId_storeId: {
                                                                                                    userId: superAdmin.id,
                                                                                                    roleId: superAdminRole.id,
                                                                                                    chainId: null as any,
                                                                                                    storeId: null as any,
                                                                                }
                                                            },
                                                            update: {},
                                                            create: {
                                                                                userId: superAdmin.id,
                                                                                roleId: superAdminRole.id,
                                                                                isActive: true,
                                                            },
                                        });
                    }
                    console.log(`  ✅ Created super admin: ${superAdmin.username} (password: admin123)`);

                    // Create chain owner
                    const chainOwner = await prisma.user.upsert({
                                        where: { username: 'owner' },
                                        update: {},
                                        create: {
                                                            chainId: chain.id,
                                                            username: 'owner',
                                                            email: 'owner@pos.local',
                                                            password: hashedPassword,
                                                            fullName: 'Chủ Chuỗi',
                                                            status: 'ACTIVE',
                                        },
                    });

                    const chainOwnerRole = await prisma.role.findUnique({ where: { code: 'chain_owner' } });
                    if (chainOwnerRole) {
                                        await prisma.userRole.upsert({
                                                            where: {
                                                                                userId_roleId_chainId_storeId: {
                                                                                                    userId: chainOwner.id,
                                                                                                    roleId: chainOwnerRole.id,
                                                                                                    chainId: chain.id,
                                                                                                    storeId: null as any,
                                                                                }
                                                            },
                                                            update: {},
                                                            create: {
                                                                                userId: chainOwner.id,
                                                                                roleId: chainOwnerRole.id,
                                                                                chainId: chain.id,
                                                                                isActive: true,
                                                            },
                                        });
                    }
                    console.log(`  ✅ Created chain owner: ${chainOwner.username}`);

                    // Create store manager
                    const storeManager = await prisma.user.upsert({
                                        where: { username: 'manager' },
                                        update: {},
                                        create: {
                                                            chainId: chain.id,
                                                            storeId: store.id,
                                                            username: 'manager',
                                                            email: 'manager@pos.local',
                                                            password: hashedPassword,
                                                            fullName: 'Quản Lý Cửa Hàng',
                                                            status: 'ACTIVE',
                                        },
                    });

                    const storeManagerRole = await prisma.role.findUnique({ where: { code: 'store_manager' } });
                    if (storeManagerRole) {
                                        await prisma.userRole.upsert({
                                                            where: {
                                                                                userId_roleId_chainId_storeId: {
                                                                                                    userId: storeManager.id,
                                                                                                    roleId: storeManagerRole.id,
                                                                                                    chainId: chain.id,
                                                                                                    storeId: store.id,
                                                                                }
                                                            },
                                                            update: {},
                                                            create: {
                                                                                userId: storeManager.id,
                                                                                roleId: storeManagerRole.id,
                                                                                chainId: chain.id,
                                                                                storeId: store.id,
                                                                                isActive: true,
                                                            },
                                        });
                    }
                    console.log(`  ✅ Created store manager: ${storeManager.username}`);

                    // Create cashier
                    const cashier = await prisma.user.upsert({
                                        where: { username: 'cashier' },
                                        update: {},
                                        create: {
                                                            chainId: chain.id,
                                                            storeId: store.id,
                                                            username: 'cashier',
                                                            email: 'cashier@pos.local',
                                                            password: hashedPassword,
                                                            fullName: 'Thu Ngân',
                                                            status: 'ACTIVE',
                                        },
                    });

                    const cashierRole = await prisma.role.findUnique({ where: { code: 'cashier' } });
                    if (cashierRole) {
                                        await prisma.userRole.upsert({
                                                            where: {
                                                                                userId_roleId_chainId_storeId: {
                                                                                                    userId: cashier.id,
                                                                                                    roleId: cashierRole.id,
                                                                                                    chainId: chain.id,
                                                                                                    storeId: store.id,
                                                                                }
                                                            },
                                                            update: {},
                                                            create: {
                                                                                userId: cashier.id,
                                                                                roleId: cashierRole.id,
                                                                                chainId: chain.id,
                                                                                storeId: store.id,
                                                                                isActive: true,
                                                            },
                                        });
                    }
                    console.log(`  ✅ Created cashier: ${cashier.username}`);

                    console.log('✅ Sample data seeding completed!');
                    console.log('\n📋 Test accounts (password: admin123):');
                    console.log('  - superadmin (Super Admin - All permissions)');
                    console.log('  - owner (Chain Owner - Chain level)');
                    console.log('  - manager (Store Manager - Store level)');
                    console.log('  - cashier (Cashier - Store level)');
}

// Run if called directly
if (require.main === module) {
                    async function main() {
                                        await seedPermissions();
                                        await seedSampleData();
                    }

                    main()
                                        .catch((e) => {
                                                            console.error(e);
                                                            process.exit(1);
                                        })
                                        .finally(async () => {
                                                            await prisma.$disconnect();
                                        });
}
