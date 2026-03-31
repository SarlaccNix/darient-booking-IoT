export interface SpaceSceneConfig {
  position: [number, number, number];
  size: [number, number, number];
}

// All units are Three.js world units (1 unit ≈ 1 meter)
// Floor plane is centered at (0, 0, 0), Y is up.
export const sceneConfig: Record<string, SpaceSceneConfig> = {
  // Alpha Tower floor plan
  space_alpha_1: { position: [-3, 0.25, -3], size: [4, 0.5, 3] },  // Board Room — large, back-left
  space_alpha_2: { position: [3, 0.25, -3],  size: [2, 0.5, 2] },  // Focus Pod A — small, back-right
  space_alpha_3: { position: [3, 0.25,  0],  size: [2, 0.5, 2] },  // Focus Pod B — small, mid-right
  space_alpha_4: { position: [0, 0.25,  3],  size: [5, 0.5, 3] },  // Open Collab — wide, front-center

  // Beta Hub floor plan
  space_beta_1: { position: [-3, 0.25, -2], size: [3, 0.5, 3] },     // Innovation Lab — large, left
  space_beta_2: { position: [3,  0.25, -3], size: [1.5, 0.5, 1.5] }, // Quiet Room — tiny, back-right
  space_beta_3: { position: [3,  0.25,  1], size: [3, 0.5, 2.5] },   // War Room — medium, right
  space_beta_4: { position: [0,  0.25,  3], size: [4, 0.5, 2] },     // Lounge Desk — wide, front
};

export const siteSpaces: Record<string, string[]> = {
  site_alpha: ['space_alpha_1', 'space_alpha_2', 'space_alpha_3', 'space_alpha_4'],
  site_beta:  ['space_beta_1',  'space_beta_2',  'space_beta_3',  'space_beta_4'],
};
