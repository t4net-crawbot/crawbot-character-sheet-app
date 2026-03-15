package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/t4net-crawbot/character-sheet/models"
)

func ListCharacters(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := context.Background()
		rows, err := db.Query(ctx, `
			SELECT id, user_id, name, lineage, heritage, class, level, background, alignment,
			       xp, luck_points, str_score, dex_score, con_score, int_score, wis_score, cha_score,
			       hp_max, hp_current, hp_temp, saving_throw_profs, skill_profs, skill_expertise,
			       personality_traits, ideals, bonds, flaws, backstory,
			       equipment, attacks, spells, talents, features,
			       cp, sp, ep, gp, pp, created_at, updated_at
			FROM characters ORDER BY created_at DESC`)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var chars []models.Character
		for rows.Next() {
			var c models.Character
			err := rows.Scan(&c.ID, &c.UserID, &c.Name, &c.Lineage, &c.Heritage, &c.Class, &c.Level,
				&c.Background, &c.Alignment, &c.XP, &c.LuckPoints,
				&c.STR, &c.DEX, &c.CON, &c.INT, &c.WIS, &c.CHA,
				&c.HPMax, &c.HPCurrent, &c.HPTemp,
				&c.SavingThrowProfs, &c.SkillProfs, &c.SkillExpertise,
				&c.PersonalityTraits, &c.Ideals, &c.Bonds, &c.Flaws, &c.Backstory,
				&c.Equipment, &c.Attacks, &c.Spells, &c.Talents, &c.Features,
				&c.CP, &c.SP, &c.EP, &c.GP, &c.PP, &c.CreatedAt, &c.UpdatedAt)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			chars = append(chars, c)
		}
		if chars == nil {
			chars = []models.Character{}
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(chars)
	}
}

func CreateCharacter(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var c models.Character
		if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if c.Equipment == nil { c.Equipment = json.RawMessage("[]") }
		if c.Attacks == nil { c.Attacks = json.RawMessage("[]") }
		if c.Spells == nil { c.Spells = json.RawMessage("{}") }
		if c.Talents == nil { c.Talents = json.RawMessage("[]") }
		if c.Features == nil { c.Features = json.RawMessage("[]") }
		if c.SavingThrowProfs == nil { c.SavingThrowProfs = []string{} }
		if c.SkillProfs == nil { c.SkillProfs = []string{} }
		if c.SkillExpertise == nil { c.SkillExpertise = []string{} }
		if c.Level == 0 { c.Level = 1 }
		if c.LuckPoints == 0 { c.LuckPoints = 0 }

		ctx := context.Background()
		err := db.QueryRow(ctx, `
			INSERT INTO characters (name, lineage, heritage, class, level, background, alignment,
				xp, luck_points, str_score, dex_score, con_score, int_score, wis_score, cha_score,
				hp_max, hp_current, hp_temp, saving_throw_profs, skill_profs, skill_expertise,
				personality_traits, ideals, bonds, flaws, backstory,
				equipment, attacks, spells, talents, features, cp, sp, ep, gp, pp)
			VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36)
			RETURNING id, user_id, name, lineage, heritage, class, level, background, alignment,
				xp, luck_points, str_score, dex_score, con_score, int_score, wis_score, cha_score,
				hp_max, hp_current, hp_temp, saving_throw_profs, skill_profs, skill_expertise,
				personality_traits, ideals, bonds, flaws, backstory,
				equipment, attacks, spells, talents, features,
				cp, sp, ep, gp, pp, created_at, updated_at`,
			c.Name, c.Lineage, c.Heritage, c.Class, c.Level, c.Background, c.Alignment,
			c.XP, c.LuckPoints, c.STR, c.DEX, c.CON, c.INT, c.WIS, c.CHA,
			c.HPMax, c.HPCurrent, c.HPTemp,
			c.SavingThrowProfs, c.SkillProfs, c.SkillExpertise,
			c.PersonalityTraits, c.Ideals, c.Bonds, c.Flaws, c.Backstory,
			c.Equipment, c.Attacks, c.Spells, c.Talents, c.Features,
			c.CP, c.SP, c.EP, c.GP, c.PP,
		).Scan(&c.ID, &c.UserID, &c.Name, &c.Lineage, &c.Heritage, &c.Class, &c.Level,
			&c.Background, &c.Alignment, &c.XP, &c.LuckPoints,
			&c.STR, &c.DEX, &c.CON, &c.INT, &c.WIS, &c.CHA,
			&c.HPMax, &c.HPCurrent, &c.HPTemp,
			&c.SavingThrowProfs, &c.SkillProfs, &c.SkillExpertise,
			&c.PersonalityTraits, &c.Ideals, &c.Bonds, &c.Flaws, &c.Backstory,
			&c.Equipment, &c.Attacks, &c.Spells, &c.Talents, &c.Features,
			&c.CP, &c.SP, &c.EP, &c.GP, &c.PP, &c.CreatedAt, &c.UpdatedAt)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(c)
	}
}

func scanCharacter(row interface{ Scan(...any) error }, c *models.Character) error {
	return row.Scan(&c.ID, &c.UserID, &c.Name, &c.Lineage, &c.Heritage, &c.Class, &c.Level,
		&c.Background, &c.Alignment, &c.XP, &c.LuckPoints,
		&c.STR, &c.DEX, &c.CON, &c.INT, &c.WIS, &c.CHA,
		&c.HPMax, &c.HPCurrent, &c.HPTemp,
		&c.SavingThrowProfs, &c.SkillProfs, &c.SkillExpertise,
		&c.PersonalityTraits, &c.Ideals, &c.Bonds, &c.Flaws, &c.Backstory,
		&c.Equipment, &c.Attacks, &c.Spells, &c.Talents, &c.Features,
		&c.CP, &c.SP, &c.EP, &c.GP, &c.PP, &c.CreatedAt, &c.UpdatedAt)
}

const selectAllFields = `
	SELECT id, user_id, name, lineage, heritage, class, level, background, alignment,
	       xp, luck_points, str_score, dex_score, con_score, int_score, wis_score, cha_score,
	       hp_max, hp_current, hp_temp, saving_throw_profs, skill_profs, skill_expertise,
	       personality_traits, ideals, bonds, flaws, backstory,
	       equipment, attacks, spells, talents, features,
	       cp, sp, ep, gp, pp, created_at, updated_at
	FROM characters WHERE id = $1`

func GetCharacter(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		ctx := context.Background()
		var c models.Character
		err := scanCharacter(db.QueryRow(ctx, selectAllFields, id), &c)
		if err != nil {
			if strings.Contains(err.Error(), "no rows") {
				http.Error(w, "character not found", http.StatusNotFound)
			} else {
				http.Error(w, err.Error(), http.StatusInternalServerError)
			}
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(c)
	}
}

func PatchCharacter(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		var patch map[string]interface{}
		if err := json.NewDecoder(r.Body).Decode(&patch); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		allowedCols := []string{
			"name", "lineage", "heritage", "class", "level", "background", "alignment",
			"xp", "luck_points", "str_score", "dex_score", "con_score", "int_score", "wis_score", "cha_score",
			"hp_max", "hp_current", "hp_temp",
			"saving_throw_profs", "skill_profs", "skill_expertise",
			"personality_traits", "ideals", "bonds", "flaws", "backstory",
			"equipment", "attacks", "spells", "talents", "features",
			"cp", "sp", "ep", "gp", "pp",
		}

		setClauses := []string{"updated_at = now()"}
		queryArgs := []interface{}{}
		paramIdx := 1
		for _, col := range allowedCols {
			if v, ok := patch[col]; ok {
				setClauses = append(setClauses, col+" = $"+strconv.Itoa(paramIdx))
				queryArgs = append(queryArgs, v)
				paramIdx++
			}
		}
		if len(setClauses) == 1 {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		queryArgs = append(queryArgs, id)
		query := "UPDATE characters SET " + strings.Join(setClauses, ", ") + " WHERE id = $" + strconv.Itoa(paramIdx)

		ctx := context.Background()
		_, err := db.Exec(ctx, query, queryArgs...)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		var c models.Character
		if err := scanCharacter(db.QueryRow(ctx, selectAllFields, id), &c); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(c)
	}
}

func DeleteCharacter(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		ctx := context.Background()
		_, err := db.Exec(ctx, "DELETE FROM characters WHERE id = $1", id)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	}
}
