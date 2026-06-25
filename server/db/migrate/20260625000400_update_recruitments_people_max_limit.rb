class UpdateRecruitmentsPeopleMaxLimit < ActiveRecord::Migration[8.1]
  def up
    remove_check_constraint :recruitments, name: "chk_recruitments_people_max"
    add_check_constraint :recruitments,
                         "recruiting_people_max <= 4",
                         name: "chk_recruitments_people_max"
  end

  def down
    remove_check_constraint :recruitments, name: "chk_recruitments_people_max"
    add_check_constraint :recruitments,
                         "recruiting_people_max <= 3",
                         name: "chk_recruitments_people_max"
  end
end
