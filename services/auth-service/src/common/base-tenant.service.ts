import { CurrentUserData } from '../auth/decorators/current-user.decorator';

/**
 * Base service that enforces multi-tenant isolation
 * All services that query tenant-specific data should extend this
 */
export abstract class BaseTenantService {
                    /**
                     * Generate tenant filter based on user's scope
                     * - Super admin: no filter (access all)
                     * - Chain level: filter by chainId
                     * - Store level: filter by chainId + storeId
                     */
                    protected getTenantFilter(user: CurrentUserData): { chainId?: number; storeId?: number } {
                                        // Super admin has access to all data
                                        if (user.roles?.some(r => r.code === 'super_admin')) {
                                                            return {};
                                        }

                                        const filter: { chainId?: number; storeId?: number } = {};

                                        // Chain-level access
                                        if (user.chainId) {
                                                            filter.chainId = user.chainId;
                                        }

                                        // Store-level access (more restrictive)
                                        if (user.storeId) {
                                                            filter.storeId = user.storeId;
                                        }

                                        return filter;
                    }

                    /**
                     * Get chain filter only (for chain-wide queries)
                     */
                    protected getChainFilter(user: CurrentUserData): { chainId?: number } {
                                        if (user.roles?.some(r => r.code === 'super_admin')) {
                                                            return {};
                                        }

                                        if (user.chainId) {
                                                            return { chainId: user.chainId };
                                        }

                                        return {};
                    }

                    /**
                     * Get store filter only (for store-specific queries)
                     */
                    protected getStoreFilter(user: CurrentUserData): { storeId?: number } {
                                        if (user.roles?.some(r => r.code === 'super_admin')) {
                                                            return {};
                                        }

                                        if (user.storeId) {
                                                            return { storeId: user.storeId };
                                        }

                                        return {};
                    }

                    /**
                     * Validate that user has access to the specified chain
                     */
                    protected canAccessChain(user: CurrentUserData, chainId: number): boolean {
                                        if (user.roles?.some(r => r.code === 'super_admin')) {
                                                            return true;
                                        }
                                        return user.chainId === chainId;
                    }

                    /**
                     * Validate that user has access to the specified store
                     */
                    protected canAccessStore(user: CurrentUserData, storeId: number): boolean {
                                        if (user.roles?.some(r => r.code === 'super_admin')) {
                                                            return true;
                                        }
                                        // Chain owner can access all stores in their chain
                                        if (user.roles?.some(r => r.level === 2)) {
                                                            return true; // Will need additional check against store's chainId
                                        }
                                        return user.storeId === storeId;
                    }
}
