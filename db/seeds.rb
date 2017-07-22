# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)
# 100.times do 
#   Game.create(
#   title: Faker::App.name,        
#   price: Faker::Number.number(2).to_i,
#   description: Faker::Hipster.sentences,
#   year: Faker::Number.number(10).to_s,
#   stock: Faker::Boolean.boolean
#   )

# end
Tutorial.all.each do |tutorial|
  tutorial.update(
experience: ["yes", "no", "maybe", "must-have", "noob", "need to be masterful"].sample
# title: Faker::App.name,
# weights: Faker::Boolean.boolean,
# experience: Faker::App.name,
# equipment_description: Faker::Hipster.sentences.to_s
    )
end
# 10.times do
# ProfileGroup.create!(
#   profile_id: Profile.pluck(:id).sample,
#   group_id: Group.pluck(:id).sample, 
#   status: "joined")
# end
 