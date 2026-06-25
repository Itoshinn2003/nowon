class SetRecruitmentsApplicationLimitDefault < ActiveRecord::Migration[8.1]
  def change
    change_column_default :recruitments, :application_limit, from: nil, to: 10
  end
end
