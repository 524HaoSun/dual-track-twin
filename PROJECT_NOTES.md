# Dual-Track Digital Twin — Build Notes

## Project Path
/home/ubuntu/dual-track-twin

## Dev Server
https://3000-iu3gn2dqzkm5vavrwsnj7-618f31a9.us2.manus.computer

## Files Created
- client/public/demo_data.json — real data (copied from upload)
- client/src/lib/demoData.ts — TypeScript types
- client/src/contexts/DataContext.tsx — loads demo_data.json
- client/src/contexts/NavContext.tsx — screen navigation state
- client/src/components/AppShell.tsx — top bar + left nav + screen router
- client/src/components/AssistantPanel.tsx — docked LLM assistant (pre-scripted)
- client/src/pages/CoverScreen.tsx — full-screen cover
- client/src/pages/DashboardScreen.tsx — hero dashboard (KPI + chart + scenario switcher)
- client/src/pages/Act1Screen.tsx — Step 1: Predict (sliders + S0 prediction)
- client/src/pages/Act2Screen.tsx — Step 2: Calibrate (S0→S4 animation)
- client/src/pages/LadderScreen.tsx — Calibration ladder staircase
- client/src/pages/Act3Screen.tsx — Step 3: Feed back (attribution + drivers)

## Data Contract Verified
- performance_gap_pct: 42.0 ✅
- final_cvrmse: 8.3 ✅
- final_band_pct: 13.0 ✅
- baseload_share_pct: 54.0 ✅
- ladder: 47.6→44.0→41.2→35.2→8.3 ✅
- grouped_importance: measured_feedback=56, schedule=25, weather=19 (JSON values)
- cold_snap week_gap_pct: 47 (JSON), term_normal: 38, holiday: 98

## Design System
- Background: #F7F9FC
- Teal: #00A6A6 (primary accent)
- Gold: #C9A227 (single focal per screen)
- Navy: #0A2540 (text/structure)
- Slate: #64748B (secondary text)
- Red rank: #E0685A, Amber: #E3A93C, Green: #5FA86B

## Status
- All screens rendering correctly
- TypeScript: 0 errors
- Assistant panel working with pre-scripted Q&A
- Data all from demo_data.json
- Next: final polish pass
