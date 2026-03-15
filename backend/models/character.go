package models

import (
	"encoding/json"
	"time"
)

type Character struct {
	ID                string          `json:"id"`
	UserID            string          `json:"user_id"`
	Name              string          `json:"name"`
	Lineage           string          `json:"lineage"`
	Heritage          string          `json:"heritage"`
	Class             string          `json:"class"`
	Level             int             `json:"level"`
	Background        string          `json:"background"`
	Alignment         string          `json:"alignment"`
	XP                int             `json:"xp"`
	LuckPoints        int             `json:"luck_points"`
	STR               int             `json:"str_score"`
	DEX               int             `json:"dex_score"`
	CON               int             `json:"con_score"`
	INT               int             `json:"int_score"`
	WIS               int             `json:"wis_score"`
	CHA               int             `json:"cha_score"`
	HPMax             int             `json:"hp_max"`
	HPCurrent         int             `json:"hp_current"`
	HPTemp            int             `json:"hp_temp"`
	SavingThrowProfs  []string        `json:"saving_throw_profs"`
	SkillProfs        []string        `json:"skill_profs"`
	SkillExpertise    []string        `json:"skill_expertise"`
	PersonalityTraits string          `json:"personality_traits"`
	Ideals            string          `json:"ideals"`
	Bonds             string          `json:"bonds"`
	Flaws             string          `json:"flaws"`
	Backstory         string          `json:"backstory"`
	Equipment         json.RawMessage `json:"equipment"`
	Attacks           json.RawMessage `json:"attacks"`
	Spells            json.RawMessage `json:"spells"`
	Talents           json.RawMessage `json:"talents"`
	Features          json.RawMessage `json:"features"`
	CP                int             `json:"cp"`
	SP                int             `json:"sp"`
	EP                int             `json:"ep"`
	GP                int             `json:"gp"`
	PP                int             `json:"pp"`
	CreatedAt         time.Time       `json:"created_at"`
	UpdatedAt         time.Time       `json:"updated_at"`
}
