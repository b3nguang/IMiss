#[cfg(target_os = "windows")]
pub mod windows {
    use crate::recording::{EventType, MouseButton, RecordedEvent};
    use std::sync::{Arc, Mutex};
    use windows_sys::Win32::Foundation::{LPARAM, LRESULT, WPARAM};
    use windows_sys::Win32::UI::WindowsAndMessaging::{
        CallNextHookEx, GetCursorPos, KBDLLHOOKSTRUCT, MSLLHOOKSTRUCT, SetWindowsHookExA,
        UnhookWindowsHookEx, HHOOK, WH_KEYBOARD_LL, WH_MOUSE_LL, WM_KEYDOWN, WM_KEYUP,
        WM_LBUTTONDOWN, WM_LBUTTONUP, WM_MBUTTONDOWN, WM_MBUTTONUP, WM_MOUSEMOVE, WM_MOUSEWHEEL,
        WM_RBUTTONDOWN, WM_RBUTTONUP,
    };

    static MOUSE_HOOK: std::sync::OnceLock<HHOOK> = std::sync::OnceLock::new();
    static KEYBOARD_HOOK: std::sync::OnceLock<HHOOK> = std::sync::OnceLock::new();
    static RECORDING_STATE: std::sync::OnceLock<Arc<Mutex<crate::recording::RecordingState>>> = std::sync::OnceLock::new();

    unsafe extern "system" fn mouse_hook_proc(
        n_code: i32,
        w_param: WPARAM,
        l_param: LPARAM,
    ) -> LRESULT {
        if n_code >= 0 {
            if let Some(state) = RECORDING_STATE.get() {
                if let Ok(mut state) = state.lock() {
                    if state.is_recording {
                        let start = state.start_instant.unwrap();
                        let time_offset_ms = start.elapsed().as_millis() as u64;

                        // l_param points to MSLLHOOKSTRUCT, extract position from it
                        let mut x = None;
                        let mut y = None;
                        let hook_struct = l_param as *const MSLLHOOKSTRUCT;
                        if !hook_struct.is_null() {
                            x = Some((*hook_struct).pt.x);
                            y = Some((*hook_struct).pt.y);
                        } else {
                            // Fallback to GetCursorPos if structure is null
                            use windows_sys::Win32::Foundation::POINT;
                            let mut point = POINT { x: 0, y: 0 };
                            if GetCursorPos(&mut point) != 0 {
                                x = Some(point.x);
                                y = Some(point.y);
                            }
                        }

                        let event_type = match w_param as u32 {
                            WM_MOUSEMOVE => Some(EventType::MouseMove),
                            WM_LBUTTONDOWN => Some(EventType::MouseDown {
                                button: MouseButton::Left,
                            }),
                            WM_LBUTTONUP => Some(EventType::MouseUp {
                                button: MouseButton::Left,
                            }),
                            WM_RBUTTONDOWN => Some(EventType::MouseDown {
                                button: MouseButton::Right,
                            }),
                            WM_RBUTTONUP => Some(EventType::MouseUp {
                                button: MouseButton::Right,
                            }),
                            WM_MBUTTONDOWN => Some(EventType::MouseDown {
                                button: MouseButton::Middle,
                            }),
                            WM_MBUTTONUP => Some(EventType::MouseUp {
                                button: MouseButton::Middle,
                            }),
                            WM_MOUSEWHEEL => {
                                // Extract wheel delta from l_param
                                let delta = ((l_param >> 16) & 0xFFFF) as i16 as i32;
                                Some(EventType::MouseWheel { delta })
                            }
                            _ => None,
                        };

                        if let Some(event_type) = event_type {
                            state.add_event(RecordedEvent {
                                event_type,
                                x,
                                y,
                                time_offset_ms,
                            });
                        }
                    }
                }
            }
        }

        CallNextHookEx(*MOUSE_HOOK.get().unwrap_or(&0), n_code, w_param, l_param)
    }

    unsafe extern "system" fn keyboard_hook_proc(
        n_code: i32,
        w_param: WPARAM,
        l_param: LPARAM,
    ) -> LRESULT {
        if n_code >= 0 {
            if let Some(state) = RECORDING_STATE.get() {
                if let Ok(mut state) = state.lock() {
                    if state.is_recording {
                        let start = state.start_instant.unwrap();
                        let time_offset_ms = start.elapsed().as_millis() as u64;

                        // l_param points to KBDLLHOOKSTRUCT
                        // Extract virtual key code from the structure
                        let hook_struct = l_param as *const KBDLLHOOKSTRUCT;
                        let vk_code = if !hook_struct.is_null() {
                            (*hook_struct).vkCode as u32
                        } else {
                            return CallNextHookEx(*KEYBOARD_HOOK.get().unwrap_or(&0), n_code, w_param, l_param);
                        };

                        let event_type = match w_param as u32 {
                            WM_KEYDOWN => Some(EventType::KeyDown { vk_code }),
                            WM_KEYUP => Some(EventType::KeyUp { vk_code }),
                            _ => None,
                        };

                        if let Some(event_type) = event_type {
                            state.add_event(RecordedEvent {
                                event_type,
                                x: None,
                                y: None,
                                time_offset_ms,
                            });
                        }
                    }
                }
            }
        }

        CallNextHookEx(*KEYBOARD_HOOK.get().unwrap_or(&0), n_code, w_param, l_param)
    }

    pub fn install_hooks(state: Arc<Mutex<crate::recording::RecordingState>>) -> Result<(), String> {
        RECORDING_STATE
            .set(state)
            .map_err(|_| "Failed to set recording state".to_string())?;

        unsafe {
            let mouse_hook = SetWindowsHookExA(
                WH_MOUSE_LL,
                Some(mouse_hook_proc),
                windows_sys::Win32::Foundation::HINSTANCE::default(),
                0,
            );

            if mouse_hook == 0 {
                return Err("Failed to install mouse hook".to_string());
            }

            MOUSE_HOOK
                .set(mouse_hook)
                .map_err(|_| "Mouse hook already installed".to_string())?;

            let keyboard_hook = SetWindowsHookExA(
                WH_KEYBOARD_LL,
                Some(keyboard_hook_proc),
                windows_sys::Win32::Foundation::HINSTANCE::default(),
                0,
            );

            if keyboard_hook == 0 {
                UnhookWindowsHookEx(mouse_hook);
                return Err("Failed to install keyboard hook".to_string());
            }

            KEYBOARD_HOOK
                .set(keyboard_hook)
                .map_err(|_| "Keyboard hook already installed".to_string())?;
        }

        Ok(())
    }

    pub fn uninstall_hooks() -> Result<(), String> {
        unsafe {
            if let Some(mouse_hook) = MOUSE_HOOK.get() {
                if *mouse_hook != 0 {
                    UnhookWindowsHookEx(*mouse_hook);
                }
            }

            if let Some(keyboard_hook) = KEYBOARD_HOOK.get() {
                if *keyboard_hook != 0 {
                    UnhookWindowsHookEx(*keyboard_hook);
                }
            }
        }

        Ok(())
    }
}

#[cfg(not(target_os = "windows"))]
pub mod windows {
    use crate::recording::RecordingState;
    use std::sync::{Arc, Mutex};

    pub fn install_hooks(_state: Arc<Mutex<crate::recording::RecordingState>>) -> Result<(), String> {
        Err("Hooks are only supported on Windows".to_string())
    }

    pub fn uninstall_hooks() -> Result<(), String> {
        Err("Hooks are only supported on Windows".to_string())
    }
}

