import fs from 'fs';
import path from 'path';

const STATE_FILE = path.join(process.cwd(), 'user_states.json');

export interface UserState {
  stage: string;
  confidence: string;
  updatedAt: string;
}

export function getUserState(momId: number): UserState | null {
  if (!fs.existsSync(STATE_FILE)) {
    return null;
  }
  try {
    const data = fs.readFileSync(STATE_FILE, 'utf8');
    const states = JSON.parse(data);
    return states[momId.toString()] || null;
  } catch (e) {
    console.error("Error reading state file:", e);
    return null;
  }
}

export function updateUserState(momId: number, stage: string, confidence: string) {
  let states: Record<string, UserState> = {};
  if (fs.existsSync(STATE_FILE)) {
    try {
      const data = fs.readFileSync(STATE_FILE, 'utf8');
      states = JSON.parse(data);
    } catch (e) {
      console.error("Error parsing state file:", e);
    }
  }

  states[momId.toString()] = {
    stage,
    confidence,
    updatedAt: new Date().toISOString().split('T')[0],
  };

  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(states, null, 2));
  } catch (e) {
    console.error("Error writing state file:", e);
  }
}

export function detectTransition(prevState: UserState | null, currentStage: string): string | null {
  if (!prevState) return null;
  if (prevState.stage !== currentStage) {
    return `Transition detected: ${prevState.stage} -> ${currentStage}`;
  }
  return null;
}
