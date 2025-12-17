const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
                    private baseUrl: string;

                    constructor() {
                                        this.baseUrl = API_URL;
                    }

                    private getToken(): string | null {
                                        if (typeof window === 'undefined') return null;
                                        return localStorage.getItem('accessToken');
                    }

                    private getHeaders(): HeadersInit {
                                        const headers: HeadersInit = {
                                                            'Content-Type': 'application/json',
                                        };

                                        const token = this.getToken();
                                        if (token) {
                                                            headers['Authorization'] = `Bearer ${token}`;
                                        }

                                        return headers;
                    }

                    async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
                                        const url = `${this.baseUrl}${endpoint}`;

                                        const response = await fetch(url, {
                                                            ...options,
                                                            headers: {
                                                                                ...this.getHeaders(),
                                                                                ...options.headers,
                                                            },
                                        });

                                        if (response.status === 401) {
                                                            // Token expired or invalid
                                                            if (typeof window !== 'undefined') {
                                                                                localStorage.removeItem('accessToken');
                                                                                localStorage.removeItem('refreshToken');
                                                                                localStorage.removeItem('user');
                                                                                window.location.href = '/login';
                                                            }
                                                            throw new Error('Unauthorized');
                                        }

                                        const data = await response.json();

                                        if (!response.ok) {
                                                            throw new Error(data.message || 'An error occurred');
                                        }

                                        return data;
                    }

                    async get<T>(endpoint: string): Promise<T> {
                                        return this.request<T>(endpoint, { method: 'GET' });
                    }

                    async post<T>(endpoint: string, body?: unknown): Promise<T> {
                                        return this.request<T>(endpoint, {
                                                            method: 'POST',
                                                            body: body ? JSON.stringify(body) : undefined,
                                        });
                    }

                    async patch<T>(endpoint: string, body?: unknown): Promise<T> {
                                        return this.request<T>(endpoint, {
                                                            method: 'PATCH',
                                                            body: body ? JSON.stringify(body) : undefined,
                                        });
                    }

                    async delete<T>(endpoint: string): Promise<T> {
                                        return this.request<T>(endpoint, { method: 'DELETE' });
                    }
}

export const api = new ApiClient();
